import { NextResponse } from "next/server";
import { minio } from "@/minio/client";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";
import sharp from "sharp";

export async function GET(request, props) {
	// Await `params` directly
	const params = await props.params;

	let userExists;
	try {
		userExists = await prisma.user.findUniqueOrThrow({
			where: { id: params.user, cover: { not: null } },
			select: { cover: true },
		});
	} catch (e) {
		return notFound();
	}

	let minioClient = minio();
	let imageBuffer;

	try {
		const stream = await minioClient.getObject(process.env.BUCKETNAME, "covers/" + userExists.cover);

		// Buffer the stream data
		imageBuffer = await new Promise((resolve, reject) => {
			const chunks = [];
			stream.on("data", (chunk) => chunks.push(chunk));
			stream.on("end", () => resolve(Buffer.concat(chunks)));
			stream.on("error", (err) => reject(err));
		});
	} catch (e) {
		return notFound();
	}

	// Use sharp to optimize and make the image a square
	const optimizedImage = await sharp(imageBuffer)
		.jpeg({ quality: 60 }) // Adjust quality as needed
		.toBuffer();

	// Return the optimized image
	return new Response(optimizedImage, {
		headers: {
			"Content-Type": "image/jpeg",
			"Cache-Control": "public, max-age=1800", // Optional client-side caching
		},
	});
}
