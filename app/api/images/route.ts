import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const pageToken = searchParams.get("pageToken");
	const pageSize = 20;

	const folderId = "1WwCE4uUXMbDBLGXBkx_Nm0f6Rw659Yzf";
	const apiKey = process.env.GOOGLE_API_KEY;
	const fields = encodeURIComponent("nextPageToken,files(id,name,mimeType,thumbnailLink)");

	const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=${fields}&pageSize=${pageSize}${pageToken ? `&pageToken=${pageToken}` : ""}`;

	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
		const data = await res.json();

		return NextResponse.json({ images: data.files.filter((f: any) => f.mimeType.startsWith("image/")), nextPageToken: data.nextPageToken });
	} catch (error) {
		console.error("Error fetching images:", error);
		return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
	}
}
