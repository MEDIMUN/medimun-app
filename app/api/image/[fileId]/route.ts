import { request as undici } from "undici";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { fileId: string } }) {
	const fileId = (await params).fileId;

	// Construct the direct download/view URL to Google Drive
	// or use the same custom URL your old code used:
	const url = decodeURIComponent(fileId);
	// Now fetch the image from Drive with undici, adding any custom headers
	const { statusCode, headers, body } = await undici(url.replace("s220", "s500"), { method: "GET", headers: { Host: "lh3.googleusercontent.com" } });

	// Optionally, you can check statusCode and handle errors.
	// For example:
	if (statusCode !== 200) {
		return NextResponse.json({ error: "Failed to fetch image from Google Drive" }, { status: statusCode });
	}

	// Identify the content type from the upstream headers (e.g. "image/jpeg").
	// In undici, `headers` is a plain object:
	// e.g. headers["content-type"] might be "image/jpeg".
	const contentType = headers["content-type"] || "application/octet-stream";

	// Return a streamed response:
	return new Response(body, {
		status: 200,
		headers: {
			"Content-Type": contentType,
			// Ensure the browser displays inline rather than forcing download:
			"Content-Disposition": "inline",
		},
	});
}
