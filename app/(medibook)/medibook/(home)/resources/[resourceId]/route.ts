import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { minio } from "@/minio/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request, { params }) {
	const authSession = await auth();
	if (!authSession) notFound();
	const selectedResource = await prisma.resource.findFirst({ where: { id: params.resourceId } });

	const minioClient = minio();
	let presignedFileUrl;
	try {
		presignedFileUrl = await minioClient.presignedGetObject(process.env.BUCKETNAME, `resources/${selectedResource.fileId}`, 30 * 60);
	} catch (e) {
		notFound();
	}
	return NextResponse.redirect(selectedResource.driveUrl ? `https://${selectedResource.driveUrl}` : presignedFileUrl);
}
