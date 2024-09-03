import { NextResponse } from "next/server";
import { minio } from "@/minio/client";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";

export async function GET(request, { params }) {
	let location;
	try {
		location = await prisma.location.findFirst({
			where: {
				id: params.locationId,
			},
			select: {
				cover: true,
			},
		});
	} catch (e) {
		notFound();
	}

	if (!location) notFound();
	if (!location.cover) notFound();

	let minioClient = minio();
	let url;
	try {
		url = await minioClient.presignedGetObject("medibook", "covers/locations/" + location.cover, 30 * 60);
	} catch (e) {
		notFound();
	}
	return NextResponse.redirect(url);
}
