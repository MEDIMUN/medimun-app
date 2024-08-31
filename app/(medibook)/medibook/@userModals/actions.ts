"use server";

import "server-only";

import { authorize, s } from "@/lib/authorize";
import { notFound, redirect } from "next/navigation";
import { countries } from "@/data/countries";
import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { generateUserData, generateUserDataObject, userData } from "@/lib/user";
import { parseFormData } from "@/lib/form";
import { z } from "zod";
import { nameCase, postProcessUsername, processPronouns } from "@/lib/text";
import { minio } from "@/minio/client";
import { type Session } from "next-auth";
import { nanoid } from "nanoid";

export async function removeRole(role, userID) {
	const session = await auth();
	const highestRoleRank = session.highestRoleRank;
	if (!session) notFound();
	if (!authorize(session, [s.management])) notFound();
	if (!userID) return { ok: false, message: "Error removing role." };
	let userToBeUpdated = await prisma.user.findFirst({
		include: { ...generateUserDataObject() },
		where: {
			id: userID,
		},
	});
	userToBeUpdated = generateUserData(userToBeUpdated);
	if (userToBeUpdated.highestRoleRank <= highestRoleRank) return { ok: false, message: "You can't edit a user with a higher or an equal rank." };
	const userId = userToBeUpdated.id;
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
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
				return { ok: false, message: "Error removing role." };
			}
	}
	return { ok: true, message: "Role removed" };
}

export async function addRole(formData, users) {
	const session = await auth();
	if (!session || !authorize(session, [s.management])) return { ok: false, message: "Not Authorized" };

	const userQuery = await prisma.user.findMany({
		where: { id: { in: users } },
		include: { ...generateUserDataObject() },
	});

	const usersWithData = userQuery.map((user) => generateUserData(user));

	const usersToBeAssignedRoles = usersWithData
		.filter((user) => {
			return user.highestRoleRank > session.highestRoleRank;
		})
		.map((user) => {
			return user.id;
		});

	if (!usersToBeAssignedRoles.length) return { ok: false, message: "No eligible users selected." };

	let { roleName, sessionId, committeeId, departmentId, country, schoolId } = parseFormData(formData);
	if (
		![
			"delegate",
			"chair",
			"member",
			"manager",
			"schoolDirector",
			"deputyPresidentOfTheGeneralAssembly",
			"deputySecretaryGeneral",
			"presidentOfTheGeneralAssembly",
			"secretaryGeneral",
			"director",
			"seniorDirector",
			"admin",
			"globalAdmin",
		].includes(roleName)
	)
		return { ok: false, message: "Error" };

	switch (roleName) {
		case "delegate":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.delegate.upsert({
							where: { userId_committeeId: { userId, committeeId } },
							update: { userId, country, committeeId },
							create: { userId, country, committeeId },
						});
					})
				)
				.catch((e) => error(e));
			break;
		case "chair":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.chair.upsert({
							where: { userId_committeeId: { userId, committeeId } },
							update: { userId, committeeId },
							create: { userId, committeeId },
						});
					})
				)
				.catch((e) => error(e));
			break;
		case "member":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.member.upsert({
							where: { userId_departmentId: { userId, departmentId } },
							update: { userId, departmentId },
							create: { userId, departmentId },
						});
					})
				)
				.catch((e) => error(e));
			break;
		case "manager":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.manager.upsert({
							where: { userId_departmentId: { userId, departmentId } },
							update: { userId, departmentId },
							create: { userId, departmentId },
						});
					})
				)
				.catch((e) => error(e));
			break;
		case "schoolDirector":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.schoolDirector.upsert({
							where: { userId_schoolId_sessionId: { userId, schoolId, sessionId } },
							update: { userId, schoolId, sessionId },
							create: { userId, schoolId, sessionId },
						});
					})
				)
				.catch((e) => error(e));
			break;
		case "deputyPresidentOfTheGeneralAssembly":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.deputyPresidentOfTheGeneralAssembly.upsert({
							where: { userId_sessionId: { userId, sessionId } },
							update: { userId, sessionId },
							create: { userId, sessionId },
						});
					})
				)
				.catch((e) => error(e));
			break;
		case "deputySecretaryGeneral":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.deputySecretaryGeneral.upsert({
							where: { userId_sessionId: { userId, sessionId } },
							update: { userId, sessionId },
							create: { userId, sessionId },
						});
					})
				)
				.catch((e) => error(e));
		case "presidentOfTheGeneralAssembly":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.presidentOfTheGeneralAssembly.upsert({
							where: { userId_sessionId: { userId, sessionId } },
							update: { userId, sessionId },
							create: { userId, sessionId },
						});
					})
				)
				.catch((e) => error(e));
			break;
		case "secretaryGeneral":
			await prisma
				.$transaction(
					usersToBeAssignedRoles.map((userId) => {
						return prisma.secretaryGeneral.upsert({
							where: { userId_sessionId: { userId, sessionId } },
							update: { userId, sessionId },
							create: { userId, sessionId },
						});
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
	return { ok: true, message: "Roles added" };
}

function error(e) {
	console.error(e);
	return { ok: false, message: "Error" };
}

export async function toggleDisableOrEnableUsers(userIds, disable = true) {
	const session = await auth();
	const highestRoleRank = session.highestRoleRank;
	if (!session || !authorize(session, [s.management])) return { ok: false, message: "Not authorized." };

	let usersToBeDisabled = (await prisma.user.findMany({ where: { id: { in: userIds } }, include: { ...generateUserDataObject() } }).catch(() => {
		return { ok: false, message: "Error while finding users." };
	})) as unknown as Session[];

	usersToBeDisabled = usersToBeDisabled.map((user) => generateUserData(user)) as unknown as Session[];

	usersToBeDisabled = usersToBeDisabled.filter((user) => user.highestRoleRank > highestRoleRank);

	const userIdsToBeDisabled = usersToBeDisabled.map((user) => user.id);

	if (!userIdsToBeDisabled.length) return { ok: false, message: "No eligible users found." };

	await prisma.user.updateMany({ where: { id: { in: userIdsToBeDisabled } }, data: { isDisabled: disable } }).catch((e) => {
		return { ok: false, message: "Error while updating users." };
	});
	return { ok: true, message: `User accounts ${disable ? "Disabled" : "Enabled"}` };
}

const fullSchemaObject = {
	id: z.string().min(12).max(12),
	officialName: z.string().min(2).max(50).transform(nameCase),
	officialSurname: z.string().min(2).max(50).transform(nameCase),
	displayName: z.string().max(75, "Display name can not be longer than 75 characters.").transform(nameCase).optional().nullable(),
	email: z.string().email().email().max(50),
	username: z.string().max(50).optional().nullable().transform(postProcessUsername),
	phoneNumber: z.string().nullable(),
	gender: z
		.enum(["MALE", "FEMALE", "PREFERNOTTOANSWER", "NONBINARY", "OTHER"])
		.transform((v) => (v ? v : null))
		.optional()
		.nullable(),
	nationality: z.string().min(2).max(2).toUpperCase().nullable(),
	pronouns: z.string().trim().max(50).optional().nullable().transform(processPronouns),
	bio: z.string().max(500).optional().nullable(),
	isProfilePrivate: z.boolean(),
	schoolId: z.string().uuid().optional().nullable(),
	isDisabled: z.boolean(),
	dateOfBirth: z
		.string()
		.max(10)
		.min(10)
		.nullable()
		.transform((d) => new Date(d)),
};

export async function editUser(formData) {
	const authSession = await auth();

	const prismaUser = await prisma.user.findFirstOrThrow({
		where: { id: formData.get("id") },
		include: { ...generateUserDataObject() },
	});
	const userData = generateUserData(prismaUser);

	//Chair and Delegate
	const authChairRoles = authSession?.user.currentRoles.filter((role) => role.roleIdentifier === "chair");
	const editUserDelegateRoles = userData?.currentRoles?.filter((role) => role.roleIdentifier === "delegate");

	//Manager and Member
	const authManagerRoles = authSession?.user.currentRoles.filter((role) => role.roleIdentifier === "manager");
	const editUserMemberRoles = userData?.currentRoles?.filter((role) => role.roleIdentifier === "member");

	//School Director and Student
	const authSchoolDirectorRoles = authSession?.user.currentRoles.filter((role) => role.roleIdentifier === "schoolDirector");
	const studentSchoolId = userData?.schoolId;

	//Generic roles that the user has
	const isManagement = authorize(authSession, [s.management]);
	const isManagerOfMember = authManagerRoles?.some((role) => editUserMemberRoles?.some((r) => r.departmentId === role.departmentId));
	const isChairOfDelegate = authChairRoles?.some((role) => editUserDelegateRoles?.some((r) => r.committeeId === role.committeeId));
	const isDirectorOfStudent = authSchoolDirectorRoles?.some((role) => role.schoolId === studentSchoolId);

	//Check if the user is authorized to edit the user
	if (!isManagement && !isChairOfDelegate && !isDirectorOfStudent && !isManagerOfMember) return { ok: false, message: "Unauthorized" };

	//Generate a list of all fields that can be updated based on the user's roles
	const allUpdatableFields = [
		"id",
		"officialName",
		"officialSurname",
		"nationality",
		"dateOfBirth",
		isManagement && "email",
		isManagement && "schoolId",
		isManagement && "isDisabled",
		(isManagement || isChairOfDelegate || isManagerOfMember) && "displayName",
		(isManagement || isChairOfDelegate || isManagerOfMember) && "username",
		(isManagement || isChairOfDelegate || isManagerOfMember) && "gender",
		(isManagement || isChairOfDelegate || isManagerOfMember) && "pronouns",
		(isManagement || isChairOfDelegate || isManagerOfMember) && "bio",
		(isManagement || isChairOfDelegate || isManagerOfMember) && "isProfilePrivate",
		(isManagement || isChairOfDelegate || isManagerOfMember) && "phoneNumber",
	];

	//Generate a custom zod schema object based on the fields that can be updated declared in allUpdatableFields
	const dynamicSchemaObject = Object.fromEntries(
		allUpdatableFields.map((field) => [field, fullSchemaObject[field]]).filter(([key, value]) => value !== undefined)
	);

	//Parse schema based on the dynamic schema object
	const schema = z.object(dynamicSchemaObject);
	const parsedFormData = parseFormData(formData);
	const { data, error } = schema.safeParse(parsedFormData);

	if (error) return { ok: false, message: "Invalid data." };

	if (authSession.highestRoleRank >= userData.highestRoleRank) return { ok: false, message: "You can't edit a user with a higher or an equal rank." };

	//Check if the username already exists fo some other user
	if (data.username) {
		const usernameExists = await prisma.user.findFirst({ where: { AND: [{ username: data.username }, { NOT: { id: data.id } }] } });
		if (usernameExists) return { ok: false, message: "Username already exists." };
	}

	try {
		const { id, schoolId, ...otherData } = data;

		//Generate a prisma data object for the STudent column
		const updateData = {
			...otherData,
			...(allUpdatableFields.includes("schoolId") && schoolId !== undefined
				? { Student: schoolId ? { connect: { id: schoolId } } : { disconnect: true } }
				: {}),
		};

		await prisma.user.update({
			where: { id: data.id },
			data: updateData,
		});
	} catch (e) {
		return { ok: false, message: "Error updating user." };
	}
	return { ok: true, message: "User updated" };
}

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

export async function unafilliateStudent(studentId: string) {
	const authSession = await auth();
	let prismaUser;
	if (!studentId) return { ok: false, message: "No student ID provided." };

	try {
		prismaUser = await prisma.user.findFirstOrThrow({
			where: { id: studentId },
			include: { ...generateUserDataObject() },
		});
	} catch (e) {
		return { ok: false, message: "User not found." };
	}

	const userData = generateUserData(prismaUser);

	if (!authSession || !authorize(authSession, [s.schooldirector])) return { ok: false, message: "Not authorized." };
	const authSchoolDirectorRoles = authSession?.user.currentRoles.filter((role) => role.roleIdentifier === "schoolDirector");
	const studentSchoolId = userData?.schoolId;
	const isDirectorOfStudent = authSchoolDirectorRoles?.some((role) => role.schoolId === studentSchoolId);
	if (authSession.highestRoleRank > userData.highestRoleRank) return { ok: false, message: "You can't edit a user with a higher or an equal rank." };

	if (!isDirectorOfStudent) return { ok: false, message: "Not authorized." };
	try {
		await prisma.user.update({
			where: { id: studentId },
			data: {
				Student: {
					disconnect: true,
				},
			},
		});
	} catch (e) {
		return { ok: false, message: "Error while unaffiliating student." };
	}
	return { ok: true, message: "Student unaffiliated." };
}
