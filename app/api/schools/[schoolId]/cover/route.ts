import { NextResponse } from "next/server";
import { minio } from "@/minio/client";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";

export async function GET(request, props) {
	const params = await props.params;
	let school;
	try {
		school = await prisma.school.findFirst({
			where: {
				id: params.schoolId,
			},
			select: {
				cover: true,
			},
		});
	} catch (e) {
		notFound();
	}

	if (!school) notFound();
	if (!school.cover) notFound();

	let minioClient = minio();
	let url;
	try {
		url = await minioClient.presignedGetObject(process.env.BUCKETNAME, "covers/schools/" + school.cover, 30 * 60);
	} catch (e) {
		notFound();
	}
	return NextResponse.redirect(url);
}
