import { NextResponse } from "next/server";
import { minio } from "@/minio/client";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";
import { NextURL } from "next/dist/server/web/next-url";

export async function GET(request, props) {
	const params = await props.params;
	/* 	return NextResponse.json({ "Not Found": "True" });
	 */
	let userExists;
	try {
		userExists = await prisma.user.findUnique({
			where: {
				id: params.user,
			},
			select: {
				profilePicture: true,
			},
		});
	} catch (e) {
		notFound();
	}

	if (!userExists) notFound();
	if (!userExists.profilePicture) return NextResponse.json({ "Not Found": "True" });

	let minioClient = minio();
	let url: string | NextURL | URL;
	try {
		url = await minioClient.presignedGetObject(process.env.BUCKETNAME, "avatars/" + userExists.profilePicture, 30 * 60);
	} catch (e) {
		notFound();
	}
	return NextResponse.redirect(url);
}
