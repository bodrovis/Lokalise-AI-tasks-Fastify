import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { LokaliseApi } from "@lokalise/node-api";
import { LokaliseDownload, LokaliseUpload } from "lokalise-file-exchange";

if (existsSync(".env")) {
	loadEnvFile();
}

const apiKey = process.env.LOKALISE_API_TOKEN as string;
export const lokaliseProjectId = process.env.LOKALISE_PROJECT_ID as string;
export const lokaliseWebhooksSecret = process.env
	.LOKALISE_WEBHOOKS_SECRET as string;

export const lokaliseUploader = new LokaliseUpload(
	{
		apiKey,
		enableCompression: true,
	},
	{
		projectId: lokaliseProjectId,
	},
);

export const lokaliseDownloader = new LokaliseDownload(
	{
		apiKey,
		enableCompression: true,
	},
	{
		projectId: lokaliseProjectId,
	},
);

export const lokaliseApi = new LokaliseApi({ apiKey });
