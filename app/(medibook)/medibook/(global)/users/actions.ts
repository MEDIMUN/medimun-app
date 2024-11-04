"use server";

import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { generateUserData, generateUserDataObject, userData } from "@/lib/user";
import { minio } from "@/minio/client";
import { type Session } from "next-auth";
import { nanoid } from "nanoid";

export async function updateProfilePictureForUser(targetUserId: string, formData: FormData) {
	const session = await auth();

	if (!authorize(session, [s.management, s.chair, s.manager])) return { ok: false, message: "Not authorized." };

	const editorData = await userData(session?.user?.id);
	const editedData = await userData(targetUserId);

	if (!targetUserId) return { ok: false, message: "No user ID provided" };
	if (!editedData) return { ok: false, message: "User not found" };

	if (editorData.highestRoleRank > editedData.highestRoleRank) return { ok: false, message: "You can't edit a user with a higher or an equal rank." };
	if (editorData.highestRoleRank === editedData.highestRoleRank) return { ok: false, message: "You can't edit a user with an equal rank." };

	const file: File = formData.get("profilePicture");

	if (!file) return { ok: false, message: "No file selected" };
	if (file.size > 5000000) return { ok: false, message: "File can't be larger than 5MB." };
	if (!file.type.includes("image")) return { ok: false, message: "File is not an image" };
	if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/gif")
		return { ok: false, message: "File is not a supported image type" };

	const minioClient = minio();
	const randomName = nanoid();

	if (editorData.highestRoleRank > editedData.highestRoleRank) return { ok: false, message: "You can't edit a user with a higher or an equal rank." };
	if (editorData.highestRoleRank === editedData.highestRoleRank) return { ok: false, message: "You can't edit a user with an equal rank." };

	if (editorData.currentRoles[0].roleIdentifier === "chair") {
		const allChairRoleCommitteeIDs = editorData.currentRoles.filter((role) => role.roleIdentifier === "chair").map((role) => role.committeeId);
		const allDelegateRoleCommitteeIDs = editedData.currentRoles.filter((role) => role.roleIdentifier === "delegate").map((role) => role.committeeId);
		if (!allChairRoleCommitteeIDs.some((committeeId) => allDelegateRoleCommitteeIDs.includes(committeeId))) {
			return { ok: false, message: "You can't edit a user outside of your committee." };
		}
	}

	if (editorData.currentRoles[0].roleIdentifier === "manager") {
		const allManagerRoleDepartmentIDs = editorData.currentRoles.filter((role) => role.roleIdentifier === "manager").map((role) => role.departmentId);
		const allMemberRoleDepartmentIDs = editedData.currentRoles.filter((role) => role.roleIdentifier === "member").map((role) => role.departmentId);
		if (!allManagerRoleDepartmentIDs.some((departmentId) => allMemberRoleDepartmentIDs.includes(departmentId))) {
			return { ok: false, message: "You can't edit a user outside of your department." };
		}
	}

	const data = await file.arrayBuffer();
	const buffer = Buffer.from(data);

	// Update the database only if upload is successful
	try {
		await prisma.$transaction(
			async (tx) => {
				await deleteProfilePictureForUser(targetUserId);
				await minioClient.putObject(process.env.BUCKETNAME, `avatars/${randomName}`, buffer, null, {
					"Content-Type": file.type,
				});
				await tx.user.update({ where: { id: targetUserId }, data: { profilePicture: randomName } });
			},
			{ maxWait: 5000, timeout: 900000 }
		);
	} catch (e) {
		return { ok: false, message: "An error occurred while updating the profile picture." };
	}
	return { ok: true, message: "Profile picture updated." };
}

export async function deleteProfilePictureForUser(targetUserId: string) {
	const session = await auth();

	if (!authorize(session, [s.management, s.chair, s.manager])) return { ok: false, message: "Not authorized." };

	const editorData = await userData(session?.user?.id);
	const editedData = await userData(targetUserId);

	if (!targetUserId) return { ok: false, message: "No user ID provided" };
	if (!editedData) return { ok: false, message: "User not found" };

	if (editorData.highestRoleRank > editedData.highestRoleRank) return { ok: false, message: "You can't edit a user with a higher or an equal rank." };
	if (editorData.highestRoleRank === editedData.highestRoleRank) return { ok: false, message: "You can't edit a user with an equal rank." };

	const minioClient = minio();

	if (editorData.highestRoleRank > editedData.highestRoleRank) return { ok: false, message: "You can't edit a user with a higher or an equal rank." };
	if (editorData.highestRoleRank === editedData.highestRoleRank) return { ok: false, message: "You can't edit a user with an equal rank." };

	if (editorData.currentRoles[0].roleIdentifier === "chair") {
		const allChairRoleCommitteeIDs = editorData.currentRoles.filter((role) => role.roleIdentifier === "chair").map((role) => role.committeeId);
		const allDelegateRoleCommitteeIDs = editedData.currentRoles.filter((role) => role.roleIdentifier === "delegate").map((role) => role.committeeId);
		if (!allChairRoleCommitteeIDs.some((committeeId) => allDelegateRoleCommitteeIDs.includes(committeeId))) {
			return { ok: false, message: "You can't edit a user outside of your committee." };
		}
	}

	if (editorData.currentRoles[0].roleIdentifier === "manager") {
		const allManagerRoleDepartmentIDs = editorData.currentRoles.filter((role) => role.roleIdentifier === "manager").map((role) => role.departmentId);
		const allMemberRoleDepartmentIDs = editedData.currentRoles.filter((role) => role.roleIdentifier === "member").map((role) => role.departmentId);
		if (!allManagerRoleDepartmentIDs.some((departmentId) => allMemberRoleDepartmentIDs.includes(departmentId))) {
			return { ok: false, message: "You can't edit a user outside of your department." };
		}
	}

	try {
		await prisma.$transaction(
			async (tx) => {
				const candidateAvatar = await tx.user.findUnique({ where: { id: targetUserId }, select: { profilePicture: true } });
				if (!candidateAvatar) return { ok: false, message: "User not found." };
				const avatar = candidateAvatar.profilePicture;
				await minioClient.removeObject(process.env.BUCKETNAME, `avatars/${avatar}`);
				await tx.user.update({ where: { id: targetUserId }, data: { profilePicture: null } });
			},
			{ maxWait: 5000, timeout: 900000 }
		);
	} catch (e) {
		return { ok: false, message: "An error occurred while deleting the photo" };
	}
	return { ok: true, message: "Profile picture deleted." };
}
