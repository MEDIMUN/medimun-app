import React from "react";
import prisma from "@/prisma/client";
import { EditUserModal, EditRolesModal, AddRolesModal, UnafilliateStudentModal } from "./modals";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";

export default async function UserModals({ searchParams }) {
	const authSession = await auth();
	const highestRoleRank = authSession?.highestRoleRank;
	let schools, sessions, committees, departments, editUserData, filteredAllowedEditUserData;

	let editSelectedUser = null;
	if (searchParams.edituser) {
		schools = prisma.school.findMany({ orderBy: { name: "asc" }, include: { location: true } }).catch(notFound);
		editSelectedUser = prisma.user.findFirst({ where: { id: searchParams.edituser }, include: { ...generateUserDataObject() } }).catch(notFound);
		[schools, editSelectedUser] = await Promise.all([schools, editSelectedUser]);
		editSelectedUser = { highestRoleRank: generateUserData(editSelectedUser)?.highestRoleRank, ...editSelectedUser };
		editSelectedUser = editSelectedUser.highestRoleRank > highestRoleRank ? editSelectedUser : null;

		//fix
		editUserData = {
			...generateUserData(editSelectedUser),
			email: editSelectedUser?.email,
			bio: editSelectedUser?.bio,
			username: editSelectedUser?.username,
			profilePicture: editSelectedUser?.profilePicture,
			phoneNumber: editSelectedUser?.phoneNumber,
			dateOfBirth: editSelectedUser?.dateOfBirth,
			isProfilePrivate: editSelectedUser?.isProfilePrivate,
			gender: editSelectedUser?.gender,
		};

		const authChairRoles = authSession?.user.currentRoles.filter((role) => role.roleIdentifier === "chair");
		const editUserDelegateRoles = editUserData?.currentRoles?.filter((role) => role.roleIdentifier === "delegate");

		const authManagerRoles = authSession?.user.currentRoles.filter((role) => role.roleIdentifier === "manager");
		const editUserMemberRoles = editUserData?.currentRoles?.filter((role) => role.roleIdentifier === "member");

		const authSchoolDirectorRoles = authSession?.user.currentRoles.filter((role) => role.roleIdentifier === "schoolDirector");
		const studentSchoolId = editUserData?.schoolId;

		const isManagerOfMember = authManagerRoles?.some((role) => editUserMemberRoles?.some((r) => r.departmentId === role.departmentId));
		const isChairOfDelegate = authChairRoles?.some((role) => editUserDelegateRoles?.some((r) => r.committeeId === role.committeeId));
		const isManagement = authorize(authSession, [s.management]);
		const isDirectorOfStudent = authSchoolDirectorRoles?.some((role) => role.schoolId === studentSchoolId);

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
			(isManagement || isChairOfDelegate || isManagerOfMember) && "phoneNumber",
			(isManagement || isChairOfDelegate || isManagerOfMember) && "gender",
			(isManagement || isChairOfDelegate || isManagerOfMember) && "pronouns",
			(isManagement || isChairOfDelegate || isManagerOfMember) && "bio",
			(isManagement || isChairOfDelegate || isManagerOfMember) && "isProfilePrivate",
		];

		const allowedEditUserData = {
			id: editUserData.id,
			profilePicture: editUserData.profilePicture,
			email: editUserData.email,
			officialName: editUserData.officialName,
			officialSurname: editUserData.officialSurname,
			displayName: editUserData.displayName,
			dateOfBirth: editUserData.dateOfBirth,
			schoolId: editUserData.schoolId,
			username: editUserData.username,
			phoneNumber: editUserData.phoneNumber,
			nationality: editUserData.nationality,
			isProfilePrivate: editUserData.isProfilePrivate,
			isDisabled: editUserData.isDisabled,
			gender: editUserData.gender,
			pronouns: editUserData.pronouns,
			bio: editUserData.bio,
		};

		//only kesy present in allUpdatableFields should appear in allowedEditUserData
		filteredAllowedEditUserData = Object.keys(allowedEditUserData)
			.filter((key) => allUpdatableFields.includes(key))
			.reduce((obj, key) => {
				obj[key] = allowedEditUserData[key];
				return obj;
			}, {});
	}

	let assignUsers = [];
	if (searchParams.assignroles) {
		const selectedUserIds = searchParams.assignroles.split("U").filter((id) => id);
		if (!selectedUserIds.length) return;
		schools = prisma.school.findMany({ orderBy: { name: "asc" }, include: { location: true } }).catch(notFound);
		sessions = prisma.session.findMany();
		committees = prisma.committee.findMany({ where: { session: { id: searchParams.session } } }).catch(notFound);
		departments = prisma.department.findMany({ where: { session: { id: searchParams.session } } }).catch(notFound);
		[schools, sessions, committees, departments] = await Promise.all([schools, sessions, committees, departments]);

		assignUsers = await prisma.user
			.findMany({
				where: { id: { in: selectedUserIds } },
				include: { ...generateUserDataObject() },
			})
			.catch(notFound);
		assignUsers = assignUsers.map((user) => generateUserData(user));
		assignUsers = assignUsers.filter((user) => user.highestRoleRank > highestRoleRank);
	}

	let selectedUser;
	if (searchParams.editroles) {
		const prismaUser = await prisma.user
			.findFirstOrThrow({
				where: { id: searchParams.editroles },
				include: { ...generateUserDataObject() },
			})
			.catch(() => {
				return;
			});

		const userData = generateUserData(prismaUser);

		if (userData.highestRoleRank <= highestRoleRank) return;
		selectedUser = userData;
	}

	let unafilliateStudent = {};
	if (searchParams.unafilliatestudent) {
		const prismaUser = await prisma.user
			.findFirst({ where: { id: searchParams.unafilliatestudent }, include: { ...generateUserDataObject() } })
			.catch(() => {
				return;
			});
		const userData = generateUserData(prismaUser);

		if (userData.highestRoleRank <= highestRoleRank) return;

		const fullUserObject = {
			fullName: userData.displayName || `${userData?.officialName} ${userData?.officialSurname}`,
			userId: userData.id,
		};

		const authSchoolDirectorRoles = authSession?.user.currentRoles.filter((role) => role.roleIdentifier === "schoolDirector");
		const studentSchoolId = userData?.schoolId;
		const isDirectorOfStudent = authSchoolDirectorRoles?.some((role) => role.schoolId === studentSchoolId);

		if (!isDirectorOfStudent) return;

		unafilliateStudent = fullUserObject;
	}

	return (
		<>
			<EditRolesModal selectedUser={selectedUser} highestRoleRank={highestRoleRank} />
			<AddRolesModal selectedUsers={assignUsers} schools={schools} sessions={sessions} committees={committees} departments={departments} />
			<EditUserModal studentSchoolId={editUserData?.schoolId} edit={filteredAllowedEditUserData} schools={schools} />
			<UnafilliateStudentModal userId={unafilliateStudent.userId} fullName={unafilliateStudent.fullName} />
		</>
	);
}
