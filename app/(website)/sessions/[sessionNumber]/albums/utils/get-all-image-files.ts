import { unstable_cacheLife as cacheLife } from "next/cache";

export async function getAllImageFiles(folderId: string) {
	"use cache";
	cacheLife("minutes");

	if (!folderId) return [];

	const apiKey = process.env.GOOGLE_API_KEY;
	const fields = encodeURIComponent("nextPageToken,files(id,name,mimeType)");
	let allImageFiles = [];
	let nextPageToken = null;

	do {
		const pageUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=${fields}&pageSize=1000${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

		try {
			const res = await fetch(pageUrl);
			if (!res.ok) {
				throw new Error(`Metadata fetch failed: ${res.status} ${res.statusText}`);
			}

			const data = await res.json();
			nextPageToken = data.nextPageToken;
			const imageFiles = (data.files || []).filter((f: any) => f.mimeType.startsWith("image/"));
			allImageFiles = [...allImageFiles, ...imageFiles];
		} catch (err) {
			break;
		}
	} while (nextPageToken);

	return allImageFiles;
}
