import { request as undici } from "undici";
import { NextResponse } from "next/server";
import sharp from "sharp";

const MAX_REDIRECTS = 5;

export async function GET(request: Request, { params }: { params: { fileId: string } }) {
	const fileId = (await params).fileId;
	let url = decodeURIComponent(fileId);

	try {
		let statusCode: number;
		let headers: Record<string, string | string[]>;
		let body: any;

		const performRequest = async (requestUrl: string) => {
			const domain = new URL(requestUrl).hostname;
			return await undici(requestUrl, {
				method: "GET",
				headers: {
					Host: domain,
				},
				maxRedirections: 0,
			});
		};

		let redirectCount = 0;
		while (redirectCount < MAX_REDIRECTS) {
			({ statusCode, headers, body } = await performRequest(url));

			if (statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308) {
				const newLocation = headers["location"];
				if (typeof newLocation === "string") {
					url = new URL(newLocation, url).toString();
					redirectCount++;
					console.log(`Redirecting to: ${url}`); // Log redirect for debugging
				} else {
					throw new Error("Invalid redirect location");
				}
			} else {
				break;
			}
		}

		if (statusCode !== 200) {
			return NextResponse.json({ error: "Failed to fetch file", status: statusCode }, { status: statusCode });
		}

		const contentType = headers["content-type"] || "application/octet-stream";

		// Check if the content is an image
		if (contentType.startsWith("image/")) {
			// Convert the body to a buffer
			const chunks = [];
			for await (const chunk of body) {
				chunks.push(chunk);
			}
			const buffer = Buffer.concat(chunks);

			// Process the image with sharp
			const logoPath = "./public/assets/branding/logos/image-watermark.png"; // Adjust this path to your logo
			const processedImage = await sharp(buffer)
				.composite([
					{
						input: logoPath,
						gravity: "southwest",
					},
				])
				.toBuffer();

			// Return the processed image
			return new Response(processedImage, {
				status: 200,
				headers: {
					"Content-Type": contentType,
					"Content-Disposition": "inline",
				},
			});
		} else {
			// If it's not an image, return the original response
			return new Response(body, {
				status: 200,
				headers: {
					"Content-Type": contentType,
					"Content-Disposition": "inline",
				},
			});
		}
	} catch (error) {
		return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
	}
}
