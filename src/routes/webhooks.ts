import type {
	DownloadFileParams,
	WebhookProjectTaskClosed,
} from "@lokalise/node-api";
import type { FastifyInstance } from "fastify";
import type { ExtractParams } from "lokalise-file-exchange";
import {
	lokaliseDownloader,
	lokaliseProjectId,
	lokaliseWebhooksSecret,
} from "../services/lokalise-api.js";

export default async function webhooksRoutes(app: FastifyInstance) {
	app.post("/notifications", async (req, reply) => {
		const payload = req.body;
		const headers = req.headers;

		console.log(payload);
		console.log(headers);

		if (headers["x-secret"] === lokaliseWebhooksSecret) {
			if (Array.isArray(payload)) {
				if (payload[0] === "ping") {
					return reply.status(200).send({ status: "success" });
				} else {
					return reply.status(400).send({ error: "Bad request" });
				}
			}

			if (typeof payload === "object" && payload !== null) {
				const webhookPayload = payload as WebhookProjectTaskClosed;
				if (
					webhookPayload.event === "project.task.closed" &&
					webhookPayload.project.id === lokaliseProjectId
				) {
					console.log(
						`Task ${webhookPayload.task.title} (ID ${webhookPayload.task.id}) has been closed in project ${webhookPayload.project.name}`,
					);

					const downloadFileParams: DownloadFileParams = {
						format: "json", // Format of downloaded translations
						original_filenames: true, // Keep original filenames from Lokalise
						indentation: "2sp", // Indentation style
						directory_prefix: "", // Directory structure prefix (optional)
						filter_data: ["translated"],
						filter_langs: ["fr"],
					};

					const extractParams: ExtractParams = {
						outputDir: "./", // Target directory for extracted files
					};

					try {
						// Download and extract translations
						console.log("Starting the download...");
						await lokaliseDownloader.downloadTranslations({
							downloadFileParams,
							extractParams,
						});
						console.log("Download completed successfully!");
					} catch (error) {
						// Handle any errors
						console.error("An error occurred during the download:", error);
					}
				}
			}
		}

		return reply.status(200).send({ status: "success" });
	});
}
