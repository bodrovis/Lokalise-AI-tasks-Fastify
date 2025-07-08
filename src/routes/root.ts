import path from "node:path";
import type { FastifyInstance } from "fastify";
import type {
	CollectFileParams,
	PartialUploadFileParams,
	ProcessUploadFileParams,
} from "lokalise-file-exchange";
import {
	lokaliseApi,
	lokaliseProjectId,
	lokaliseUploader,
} from "../services/lokalise-api.js";

const tag = "ai-task";

export default async function rootRoutes(app: FastifyInstance) {
	app.get("/", async () => {
		return { msg: "Hi!" };
	});

	app.post("/lokalise-upload", async () => {
		await uploadToLokalise();
		
		const keyIds = await prepareKeyIds();
		console.log(keyIds);
		await createLokaliseTask(keyIds);

		return { msg: "Translation files uploaded" };
	});
}

async function prepareKeyIds(): Promise<number[]> {
	const { items } = await lokaliseApi.keys().list({
		project_id: lokaliseProjectId,
		filter_tags: tag,
		limit: 500,
	});

	return items.map(({ key_id }) => key_id);
}

async function createLokaliseTask(keyIds: number[] | string[]) {
	await lokaliseApi.tasks().create(
		{
			title: "English <> French (AI)",
			description: "Use informal, casual tone",
			task_type: "automatic_translation",
			keys: keyIds,
			languages: [{ language_iso: "fr" }],
			apply_ai_tm100_matches: true,
			save_ai_translation_to_tm: true,
		},
		{ project_id: lokaliseProjectId },
	);
}

async function uploadToLokalise() {
	const uploadFileParams: PartialUploadFileParams = {
		replace_modified: true,
		tags: [tag],
	};

	const collectFileParams: CollectFileParams = {
		inputDirs: ["./locales"], // Directories to collect files from
		extensions: [".json"], // Collect JSON and XML files
		recursive: true, // Collect files in all nested folders
	};

	const processUploadFileParams: ProcessUploadFileParams = {
		pollStatuses: true, // Wait for file processing to complete on Lokalise
		languageInferer: (filePath) => {
			// Custom logic to infer language ISO from directory structure
			try {
				const parentDir = path.dirname(filePath);
				const baseName = path.basename(parentDir);
				return baseName !== "locales" ? baseName : "";
			} catch (_error) {
				return "";
			}
		},
	};

	try {
		// Upload translations to Lokalise
		const { processes, errors } = await lokaliseUploader.uploadTranslations({
			uploadFileParams,
			collectFileParams,
			processUploadFileParams,
		});

		// Log process details
		for (const process of processes) {
			console.log("Created At:", process.created_at);
			console.log("Status:", process.status);
			console.log("Details:", process.details);
			console.log("===");
		}

		// Handle and log any errors
		if (errors.length > 0) {
			console.error("Errors during upload:");
			for (const error of errors) {
				console.error(error);
			}
		}
	} catch (error) {
		// Handle unexpected errors
		console.error("Unexpected error:", error);
	}
}
