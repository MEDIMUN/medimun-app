"use server";

import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { z } from "zod";
import { parseFormData } from "@/lib/parse-form-data";
import { entityCase } from "@/lib/text";
import { verifyPassword } from "@/lib/password-hash";
/*@ts-ignore*/
import { minio } from "@/minio/client";
import { nanoid } from "nanoid";

/* model School {
	id         String           @id @default(nanoid())
	name       String           @unique
	slug       String?          @unique
	joinYear   Int?
	isPublic   Boolean          @default(false)
	//
	cover      String?
	//
	phone      String?
	email      String?
	website    String?
	location   Location?        @relation(fields: [locationId], references: [id])
	locationId String?
	director   SchoolDirector[]
	User       User[]
	Role       Role[]
 } */

const editSchema = z.object({
	id: z.string().optional().nullable(),
	name: z.string().min(2, "Name must be 2-64 characters long").max(64, "Name must be 2-64 characters long").transform(entityCase),
	slug: z
		.string()
		.min(2, "Slug must be 2-50 characters long")
		.max(50, "Slug must be 2-50 characters long")
		.regex(/^[a-z0-9-]+$/, "Slug must be alphanumeric")
		.optional()
		.nullable(),
	joinYear: z.coerce
		.number()
		.int()
		.min(1900, "Year must be between 1900 and 2100")
		.max(2100, "Year must be between 1900 and 2100")
		.optional()
		.nullable(),
	isPublic: z.boolean(),
	cover: z.string().optional().nullable(),
	phone: z.string().optional().nullable(),
	locationId: z.string().optional().nullable(),
	email: z.string().email().min(5, "Email must be 5-100 characters long").max(100, "Email must be 5-100 characters long").optional().nullable(),
	website: z.string().url().min(5, "Website must be 5-200 characters long").max(200, "Website must be 5-200 characters long").optional().nullable(),
});

const addSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters long").max(50, "Name must at most 50 characters long").transform(entityCase),
});

export async function addSchool(formData: FormData) {
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };
	const parsedData = parseFormData(formData);
	const { success, data } = addSchema.safeParse(parsedData);
	if (!success) return { ok: false, message: "Invalid Data." };
	let school;
	try {
		school = await prisma.school.create({
			data: {
				name: data.name,
			},
		});
	} catch {
		return { ok: false, message: "Something went wrong" };
	}
	return { ok: true, message: "School created", id: school.id };
}

export async function editSchool(formData: FormData) {
	const session = await auth();
	if (!session || !authorize(session, [s.management])) return { ok: false, message: "Unauthorized" };
	const parsedData = parseFormData(formData);
	const { success, data } = editSchema.safeParse(parsedData);
	if (!success) return { ok: false, message: "Invalid Data." };
	const { id, locationId, ...schoolData } = data;
	try {
		await prisma.school.update({
			where: { id: id },
			data: {
				...schoolData,
				location: locationId ? { connect: { id: locationId } } : { disconnect: true },
			},
		});
	} catch (e) {
		return { ok: false, message: "Something went wrong" };
	}
	return { ok: true, message: "School updated" };
}

export async function deleteSchool(formData: FormData) {
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };
	const id = formData.get("id").toString();
	const res = await deleteCoverImage(id);
	if (!res.ok) return { ok: false, message: "Something went wrong." };
	const password = formData.get("password").toString();
	const user = await prisma.user.findUnique({ where: { id: authSession.user.id }, include: { Account: true } });
	if (!id || !password) return { ok: false, message: "Invalid data" };
	if (!(await verifyPassword(password, user?.Account[0].password))) return { ok: false, message: "Invalid password" };
	await prisma.school.delete({ where: { id: id } }).catch(() => {
		return { ok: false, message: "Something went wrong." };
	});
	return { ok: true, message: "School deleted" };
}

export async function updateCoverImage(formData: FormData) {
	const authSession = await auth();
	if (!authorize(authSession, [s.management])) return { ok: false, message: "Not authorized." };
	const file: File = formData.get("file") as File;
	const schoolId = formData.get("id") as string;
	if (!file) return { ok: false, message: "No file selected" };
	if (file.size > 5000000) return { ok: false, message: "File can't be larger than 5MB." };
	if (!file.type.includes("image")) return { ok: false, message: "File is not an image" };
	if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/gif")
		return { ok: false, message: "File is not a supported image type" };
	const minioClient = minio();
	const randomName = nanoid();
	const data = await file.arrayBuffer();
	const buffer = Buffer.from(data);

	try {
		await prisma.$transaction(
			async (tx) => {
				await deleteCoverImage(schoolId);
				await minioClient.putObject(process.env.BUCKETNAME, `covers/schools/${randomName}`, buffer, null, {
					"Content-Type": file.type,
				});
				await tx.school.update({ where: { id: schoolId }, data: { cover: randomName } });
			},
			{ maxWait: 5000, timeout: 900000 }
		);
	} catch (e) {
		return { ok: false, message: "An error occurred while updating the cover image." };
	}
	return { ok: true, message: "Cover image updated." };
}

export async function deleteCoverImage(schoolId: string) {
	const authSession = await auth();
	if (!authorize(authSession, [s.management])) return { ok: false, message: "Not authorized." };
	const minioClient = minio();

	try {
		await prisma.$transaction(
			async (tx) => {
				const school = await tx.school.findUnique({ where: { id: schoolId }, select: { cover: true } });
				if (!school) return { ok: false, message: "School not found." };
				const { cover } = school;
				await minioClient.removeObject(process.env.BUCKETNAME, `covers/schools/${cover}`);
				await tx.school.update({ where: { id: schoolId }, data: { cover: null } });
			},
			{ maxWait: 5000, timeout: 900000 }
		);
	} catch (e) {
		return { ok: false, message: "An error occurred while deleting the cover." };
	}
	return { ok: true, message: "Cover image deleted." };
}
