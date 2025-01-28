"use server";
import { auth } from "@/auth";
import prisma from "@/prisma/client";
/*@ts-ignore*/
import { minio } from "@/minio/client";
import { nanoid } from "nanoid";

export async function checkUsername(username: string) {
	const session = await auth();
	if (!session)
		return {
			ok: false,
			message: "Not authenticated",
			response: null,
		};
	const user = await prisma.user.findFirst({
		where: {
			AND: [
				{ username: username },
				{
					id: {
						not: session.user.id,
					},
				},
			],
		},
	});
	if (user)
		return {
			ok: false,
			message: "Username is already taken",
			response: false,
		};
	return {
		ok: true,
		message: "Username is available",
		response: true,
	};
}

export async function clearBio() {
	const authSession = await auth();
	if (!authSession)
		return {
			ok: false,
			message: "Not authenticated.",
			response: null,
		};
	try {
		await prisma.user.update({
			where: {
				id: authSession.user.id,
			},
			data: {
				bio: null,
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: "Failed to clear biography.",
			response: null,
		};
	}
	return {
		ok: true,
		message: "Biography cleared successfully.",
		response: null,
	};
}

export async function updatePrivateProfilePicture(formData: FormData) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Not authorized." };
	const file: File = formData.get("file") as File;
	const userId = authSession.user.id;
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
				await deletePrivateProfilePicture();
				await minioClient.putObject(process.env.BUCKETNAME, `avatars/${randomName}`, buffer, null, {
					"Content-Type": file.type,
				});
				await tx.user.update({ where: { id: userId }, data: { profilePicture: randomName } });
			},
			{ maxWait: 5000, timeout: 900000 }
		);
	} catch (e) {
		return { ok: false, message: "An error occurred while updating the profile picture." };
	}
	return { ok: true, message: "Profile picture updated." };
}

export async function deletePrivateProfilePicture() {
	const authSession = await auth();
	const minioClient = minio();
	const userId = authSession.user.id;

	try {
		await prisma.$transaction(
			async (tx) => {
				const user = await tx.user.findUnique({ where: { id: userId }, select: { profilePicture: true } });
				if (!user) return { ok: false, message: "Location not found." };
				const { profilePicture } = user;
				await minioClient.removeObject(process.env.BUCKETNAME, `avatars/${profilePicture}`);
				await tx.user.update({ where: { id: userId }, data: { profilePicture: null } });
			},
			{ maxWait: 5000, timeout: 900000 }
		);
	} catch (e) {
		return { ok: false, message: "An error occurred while deleting the profile picture." };
	}
	return { ok: true, message: "Profile picture deleted." };
}
