"use server";

import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { z } from "zod";
import { countries } from "@/data/countries";
import { parseFormData } from "@/lib/form";
import { entityCase } from "@/lib/text";
import { verifyPassword } from "@/lib/password";
/*@ts-ignore*/
import { minio } from "@/minio/client";
import { nanoid } from "nanoid";

const editSchema = z.object({
	name: z.string().min(2, "Name must be 2-64 characters long").max(64, "Name must be 2-64 characters long").transform(entityCase),
	slug: z
		.string()
		.min(2, "Slug must be 2-50 characters long")
		.max(50, "Slug must be 2-50 characters long")
		.regex(/^[a-z0-9-]+$/, "Slug must be alphanumeric")
		.optional()
		.nullable(),
	description: z
		.string()
		.min(10, "Description must be 10-500 characters long")
		.max(500, "Description must be 10-500 characters long")
		.optional()
		.nullable(),
	street: z.string().min(5, "Street must be 5-100 characters long").max(100, "Street must be 5-100 characters long").optional().nullable(),
	city: z.string().min(2, "City must be 2-50 characters long").max(50, "City must be 2-50 characters long").optional().nullable(),
	state: z.string().min(2, "State must be 2-50 characters long").max(50, "State must be 2-50 characters long").optional().nullable(),
	zipCode: z.string().min(4, "Zip code must be 4-10 characters long").max(10, "Zip code must be 4-10 characters long").optional().nullable(),
	country: z
		.string()
		.refine((val) => countries.some((country) => country.countryCode === val), {
			message: "Invalid country",
		})
		.optional()
		.nullable(),
	isPublic: z.boolean(),
	phone: z.string().optional().nullable(),
	email: z.string().email().min(5, "Email must be 5-100 characters long").max(100, "Email must be 5-100 characters long").optional().nullable(),
	website: z.string().url().min(5, "Website must be 5-200 characters long").max(200, "Website must be 5-200 characters long").optional().nullable(),
	id: z.string().optional().nullable(),
});

const addSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters long").max(50, "Name must at most 50 characters long").transform(entityCase),
});

export async function addLocation(formData: FormData) {
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };
	const parsedData = parseFormData(formData);
	const { success, data } = addSchema.safeParse(parsedData);
	if (!success) return { ok: false, message: "Invalid Data." };
	let location: {
		id: any;
		name?: string;
		slug?: string;
		isPublic?: boolean;
		street?: string;
		city?: string;
		state?: string;
		zipCode?: string;
		country?: string;
		cover?: string;
		phone?: string;
		email?: string;
		website?: string;
	};
	try {
		location = await prisma.location.create({
			data: {
				name: data.name,
			},
		});
	} catch {
		return { ok: false, message: "Something went wrong" };
	}
	return { ok: true, message: "Location created", id: location.id };
}

export async function editLocation(formData: FormData) {
	const session = await auth();
	if (!session || !authorize(session, [s.management])) return { ok: false, message: "Unauthorized" };
	const parsedData = parseFormData(formData);
	const { success, data } = editSchema.safeParse(parsedData);
	if (!success) return { ok: false, message: "Invalid Data." };
	const { id, ...locationData } = data;

	try {
		await prisma.location.update({
			where: { id: id },
			data: { ...locationData },
		});
	} catch (e) {
		return { ok: false, message: "Something went wrong" };
	}
	return { ok: true, message: "Location updated" };
}

export async function deleteLocation(formData: FormData) {
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };
	const id = formData.get("id").toString();
	const res = await deleteCoverImage(id);
	if (!res.ok) return { ok: false, message: "Something went wrong." };
	const password = formData.get("password").toString();
	const user = await prisma.user.findUnique({ where: { id: authSession.user.id }, include: { account: true } });
	if (!id || !password) return { ok: false, message: "Invalid data" };
	if (!(await verifyPassword(password, user.account.password))) return { ok: false, message: "Invalid password" };
	await prisma.location.delete({ where: { id: id } }).catch(() => {
		return { ok: false, message: "Something went wrong." };
	});
	return { ok: true, message: "Location deleted" };
}

export async function updateCoverImage(formData: FormData) {
	const authSession = await auth();
	if (!authorize(authSession, [s.management])) return { ok: false, message: "Not authorized." };
	const file: File = formData.get("file") as File;
	const locationId = formData.get("id") as string;
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
				await deleteCoverImage(locationId);
				await minioClient.putObject("medibook", `covers/locations/${randomName}`, buffer, null, {
					"Content-Type": file.type,
				});
				await tx.location.update({ where: { id: locationId }, data: { cover: randomName } });
			},
			{ maxWait: 5000, timeout: 900000 }
		);
	} catch (e) {
		return { ok: false, message: "An error occurred while updating the cover image." };
	}
	return { ok: true, message: "Cover image updated." };
}

export async function deleteCoverImage(locationId: string) {
	const authSession = await auth();
	if (!authorize(authSession, [s.management])) return { ok: false, message: "Not authorized." };
	const minioClient = minio();

	try {
		await prisma.$transaction(
			async (tx) => {
				const location = await tx.location.findUnique({ where: { id: locationId }, select: { cover: true } });
				if (!location) return { ok: false, message: "Location not found." };
				const { cover } = location;
				await minioClient.removeObject("medibook", `covers/locations/${cover}`);
				await tx.location.update({ where: { id: locationId }, data: { cover: null } });
			},
			{ maxWait: 5000, timeout: 900000 }
		);
	} catch (e) {
		return { ok: false, message: "An error occurred while deleting the cover." };
	}
	return { ok: true, message: "Cover image deleted." };
}
