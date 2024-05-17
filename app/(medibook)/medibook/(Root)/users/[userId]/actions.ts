"use server";

import "server-only";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { countries } from "@/data/countries";
import prisma from "@/prisma/client";
import { capitaliseEachWord } from "@/lib/capitaliseEachWord";
import { userData } from "@/lib/user-data";
import { date, z } from "zod";
import { nameCase, postProcessUsername, processPronouns } from "@/lib/text";
import { minio } from "@/minio/client";
import { nanoid } from "nanoid";

async function generateRandom12DigitNumber() {
	let number = Math.floor(Math.random() * 9) + 1;
	const currentYear = new Date().getFullYear().toString();
	for (let i = 1; i < 8; i++) {
		number = number * 10 + Math.floor(Math.random() * 10);
	}
	const mergedNumber = currentYear.toString() + number.toString();
	const user = await prisma.user.findUnique({ where: { id: mergedNumber } }).catch(notFound);
	if (user) {
		return generateRandom12DigitNumber();
	} else {
		return mergedNumber;
	}
}

function parseFormData(formData) {
	const rawData = Object.fromEntries(formData);
	const data = Object.keys(rawData).reduce((acc, key) => {
		if (rawData[key] === "null") {
			acc[key] = null;
		} else if (rawData[key] === "undefined") {
			acc[key] = undefined;
		} else if (rawData[key] === "true") {
			acc[key] = true;
		} else if (rawData[key] === "false") {
			acc[key] = false;
		} else if (rawData[key] === "") {
			acc[key] = null;
		} else {
			acc[key] = rawData[key].trim();
		}
		return acc;
	}, {}) as any;
	return data;
}

export async function editUser(formData) {
	const session = await getServerSession(authOptions as any);
	if (!session || !authorize(session, [s.management])) return { ok: false, message: "Not authorized." };

	const schema = z.object({
		id: z.string().min(12).max(12),
		officialName: z.string().min(2).max(50).transform(nameCase),
		officialSurname: z.string().min(2).max(50).transform(nameCase),
		displayName: z.string().max(75, "Display name can not be longer than 75 characters.").transform(nameCase).optional().nullable(),
		email: z.string().email().email().max(50),
		username: z.string().max(50).optional().nullable().transform(postProcessUsername),
		phoneNumber: z.string(),
		gender: z.enum(["MALE", "FEMALE", "PREFERNOTTOANSWER", "NONBINARY", "OTHER"]),
		nationality: z.string().min(2).max(2).toUpperCase(),
		phoneCode: z.string().min(2).max(2).toUpperCase(),
		pronouns: z.string().trim().max(50).optional().nullable().transform(processPronouns),
		bio: z.string().max(500).optional().nullable(),
		isProfilePrivate: z.boolean(),
		schoolId: z.string().uuid().optional().nullable(),
		dateOfBirth: z
			.string()
			.max(10)
			.min(10)
			.nullable()
			.transform((d) => new Date(d)),
	});
	const { success, data } = schema.safeParse(parseFormData(formData));
	if (!success) return { ok: false, message: "Invalid data." };

	const user = await prisma.user.findUnique({ where: { id: data?.id } });
	if (!user) return { ok: false, message: "User not found." };

	const editorData = await userData(session?.user?.id);
	const editedData = await userData(data.id);

	if (!authorize(session, [s.management, s.chair, s.manager])) return { ok: false, message: "Not authorized." };

	if (!user) return { ok: false, message: "User not found." };

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

	if (data.username) {
		const usernameExists = await prisma.user.findFirst({ where: { AND: [{ username: data.username }, { NOT: { id: data.id } }] } });
		if (usernameExists) return { ok: false, message: "Username already exists." };
	}

	const { id, schoolId, ...otherData } = data;

	try {
		await prisma.user.update({
			where: { id: data.id },
			data: {
				...otherData,
				Student: schoolId ? { connect: { id: schoolId } } : { disconnect: true },
			},
		});
	} catch (e) {
		return { ok: false, message: "Error updating user." };
	}

	return { ok: true, message: "User updated" };
}

export async function updateProfilePictureForUser(targetUserId: string, formData: FormData) {
	const session = await getServerSession(authOptions as any);

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
	if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/gif") return { ok: false, message: "File is not a supported image type" };

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
				await minioClient.putObject("medibook", `avatars/${randomName}`, buffer, null, {
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
	const session = await getServerSession(authOptions as any);

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
				await minioClient.removeObject("medibook", `avatars/${avatar}`);
				await tx.user.update({ where: { id: targetUserId }, data: { profilePicture: null } });
			},
			{ maxWait: 5000, timeout: 900000 }
		);
	} catch (e) {
		return { ok: false, message: "An error occurred while deleting the photo" };
	}
	return { ok: true, message: "Profile picture deleted." };
}

export async function toggleDisableUser(userId) {
	const session = await getServerSession(authOptions);
	const highestRoleRank = session.highestRoleRank;
	if (!session) notFound();
	if (!authorize(session, [s.management])) notFound();
	const userToBeDisabled = await userData(userId);
	if (!userToBeDisabled) return { ok: false, title: "Error", variant: "error" };
	if (userToBeDisabled.highestRoleRank < highestRoleRank || userToBeDisabled.highestRoleRank == highestRoleRank) return { ok: false, title: "You can't disable a user with a higher or an equal rank", variant: "destructive" };
	const user = (await prisma.user.findUnique({ where: { id: userId } }).catch()).isDisabled;
	await prisma.user.update({ where: { id: userId }, data: { isDisabled: !user } }).catch((e) => {
		return { ok: false, title: "Error", variant: "error" };
	});
	return { ok: true, title: `User ${user ? "Enabled" : "Disabled"}`, variant: "default" };
}

export async function addRole(formData) {
	const session = await getServerSession(authOptions);
	const highestRoleRank = session.highestRoleRank;
	if (!session) notFound();
	if (!authorize(session, [s.management])) notFound();
	let { users, roleName, sessionId, committeeId, departmentId, country, schoolId, jobDescription = null } = Object.fromEntries(formData),
		selectedUsers = [];
	users = users.split(",");
	if (!["delegate", "chair", "member", "manager", "schoolDirector", "deputyPresidentOfTheGeneralAssembly", "deputySecretaryGeneral", "presidentOfTheGeneralAssembly", "secretaryGeneral", "director", "seniorDirector", "admin", "globalAdmin"].includes(roleName)) return { ok: false, title: "Error", variant: "destructive" };
	if (users.length > 20) return { ok: false, title: "Can't edit more than 20 users at once.", variant: "destructive" };
	for (const userId of users) {
		const user = await userData(userId);
		if (user) selectedUsers.push(user);
	}
	const usersToBeAssignedRoles = selectedUsers
		.filter((user) => {
			return user.highestRoleRank > highestRoleRank;
		})
		.map(({ user }) => {
			return user.id;
		});
	if (!usersToBeAssignedRoles) return { ok: false, title: "Error", variant: "destructive" };

	switch (roleName) {
		case "delegate":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.delegate.upsert({ where: { userId_committeeId: { userId, committeeId } }, update: { userId, country, committeeId }, create: { userId, country, committeeId } });
					})
				)
				.catch((e) => error(e));
			break;
		case "chair":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.chair.upsert({ where: { userId_committeeId: { userId, committeeId } }, update: { userId, committeeId }, create: { userId, committeeId } });
					})
				)
				.catch((e) => error(e));
			break;
		case "member":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.member.upsert({ where: { userId_departmentId: { userId, departmentId } }, update: { userId, departmentId, jobDescription }, create: { userId, departmentId, jobDescription } });
					})
				)
				.catch((e) => error(e));
			break;
		case "manager":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.manager.upsert({ where: { userId_departmentId: { userId, departmentId } }, update: { userId, departmentId }, create: { userId, departmentId } });
					})
				)
				.catch((e) => error(e));
			break;
		case "schoolDirector":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.schoolDirector.upsert({ where: { userId_schoolId_sessionId: { userId, schoolId, sessionId } }, update: { userId, schoolId, sessionId }, create: { userId, schoolId, sessionId } });
					})
				)
				.catch((e) => error(e));
			break;
		case "deputyPresidentOfTheGeneralAssembly":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.deputyPresidentOfTheGeneralAssembly.upsert({ where: { userId_sessionId: { userId, sessionId } }, update: { userId, sessionId }, create: { userId, sessionId } });
					})
				)
				.catch((e) => error(e));
			break;
		case "deputySecretaryGeneral":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.deputySecretaryGeneral.upsert({ where: { userId_sessionId: { userId, sessionId } }, update: { userId, sessionId }, create: { userId, sessionId } });
					})
				)
				.catch((e) => error(e));
		case "presidentOfTheGeneralAssembly":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.presidentOfTheGeneralAssembly.upsert({ where: { userId_sessionId: { userId, sessionId } }, update: { userId, sessionId }, create: { userId, sessionId } });
					})
				)
				.catch((e) => error(e));
			break;
		case "secretaryGeneral":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.secretaryGeneral.upsert({ where: { userId_sessionId: { userId, sessionId } }, update: { userId, sessionId }, create: { userId, sessionId } });
					})
				)
				.catch((e) => error(e));
			break;
		case "director":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.director.upsert({ where: { id: userId }, update: { id: userId }, create: { id: userId } });
					})
				)
				.catch((e) => error(e));
			break;
		case "seniorDirector":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.seniorDirector.upsert({ where: { id: userId }, update: { id: userId }, create: { id: userId } });
					})
				)
				.catch((e) => error(e));
			break;
		case "admin":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.admin.upsert({ where: { id: userId }, update: { id: userId }, create: { id: userId } });
					})
				)
				.catch((e) => error(e));
			break;
		case "globalAdmin":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.globalAdmin.upsert({ where: { id: userId }, update: { id: userId }, create: { id: userId } });
					})
				)
				.catch((e) => error(e));
			break;
	}
	return { ok: true, title: "Roles added", variant: "default" };
}

export async function removeRole(role, user) {
	const session = await getServerSession(authOptions);
	const highestRoleRank = session.highestRoleRank;
	if (!session) notFound();
	if (!authorize(session, [s.management])) notFound();
	if (!user) return { ok: false, title: "Error", variant: "error" };
	const userToBeUpdated = await userData(user.user.id);
	if (userToBeUpdated.highestRoleRank < highestRoleRank || userToBeUpdated.highestRoleRank == highestRoleRank) return { ok: false, title: "You can't edit a user with a higher or an equal rank", variant: "destructive" };
	const userId = userToBeUpdated.user.id;
	const roleIdentifier = role.roleIdentifier;
	const committeeId = role.committeeId;
	const departmentId = role.departmentId;
	const schoolId = role.schoolId;
	const sessionId = role.sessionId;

	//only a single user can be updated
	switch (roleIdentifier) {
		case "delegate":
			try {
				await prisma.delegate.delete({
					where: {
						userId_committeeId: {
							userId,
							committeeId,
						},
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "chair":
			try {
				await prisma.chair.delete({
					where: {
						userId_committeeId: {
							userId,
							committeeId,
						},
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "member":
			try {
				await prisma.member.delete({
					where: {
						userId_departmentId: {
							userId,
							departmentId,
						},
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "manager":
			try {
				await prisma.manager.delete({
					where: {
						userId_departmentId: {
							userId,
							departmentId,
						},
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "schoolDirector":
			try {
				await prisma.schoolDirector.delete({
					where: {
						userId_schoolId_sessionId: {
							userId,
							schoolId,
							sessionId,
						},
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "deputyPresidentOfTheGeneralAssembly":
			try {
				await prisma.deputyPresidentOfTheGeneralAssembly.delete({
					where: {
						userId_sessionId: {
							userId,
							sessionId,
						},
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "deputySecretaryGeneral":
			try {
				await prisma.deputySecretaryGeneral.delete({
					where: {
						userId_sessionId: {
							userId,
							sessionId,
						},
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "presidentOfTheGeneralAssembly":
			try {
				await prisma.presidentOfTheGeneralAssembly.delete({
					where: {
						userId_sessionId: {
							userId,
							sessionId,
						},
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "secretaryGeneral":
			try {
				await prisma.secretaryGeneral.delete({
					where: {
						userId_sessionId: {
							userId,
							sessionId,
						},
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "director":
			try {
				await prisma.director.delete({
					where: {
						id: userId,
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "seniorDirector":
			try {
				await prisma.seniorDirector.delete({
					where: {
						id: userId,
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "admin":
			try {
				await prisma.admin.delete({
					where: {
						id: userId,
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
			break;
		case "globalAdmin":
			try {
				await prisma.globalAdmin.delete({
					where: {
						id: userId,
					},
				});
			} catch {
				return { ok: false, title: "Error removing role", variant: "destructive" };
			}
	}
	return { ok: true, title: "Role removed", variant: "default" };
}
