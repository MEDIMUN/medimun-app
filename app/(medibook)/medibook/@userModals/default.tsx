import React from "react";
import prisma from "@/prisma/client";
import { EditUserModal, EditRolesModal, AddRolesModal, UnafilliateStudentModal, CreateUserModal, DeleteUserModal } from "./modals";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";

export default async function UserModals(props) {
	const searchParams = await props.searchParams;
	const authSession = await auth();
	const highestRoleRank = authSession?.user?.highestRoleRank;
	let schools, sessions, committees, departments, editUserData, filteredAllowedEditUserData;

	let editSelectedUser = null;
	if (searchParams["edit-user"]) {
		schools = prisma.school.findMany({ orderBy: { name: "asc" }, include: { location: true } }).catch();
		editSelectedUser = await prisma.user.findFirst({ where: { id: searchParams["edit-user"] }, include: { ...generateUserDataObject() } }).catch();
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
			"currentRoles",
			"pastRoles",
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
			currentRoles: editUserData.currentRoles,
			pastRoles: editUserData.pastRoles,
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
	if (searchParams["assign-roles"]) {
		const selectedUserIds = searchParams["assign-roles"].split(",").filter((id) => id);
		if (!selectedUserIds?.length) return;
		schools = prisma.school.findMany({ orderBy: { name: "asc" }, include: { location: true } }).catch();
		sessions = prisma.session.findMany({ orderBy: [{ numberInteger: "desc" }] });
		committees = prisma.committee.findMany({ where: { session: { id: searchParams.session } } }).catch();
		departments = prisma.department.findMany({ where: { session: { id: searchParams.session } } }).catch();
		[schools, sessions, committees, departments] = await Promise.all([schools, sessions, committees, departments]);

		assignUsers = await prisma.user
			.findMany({
				where: { id: { in: selectedUserIds } },
				include: { ...generateUserDataObject() },
			})
			.catch();
		assignUsers = assignUsers.map((user) => generateUserData(user));
		assignUsers = assignUsers.filter((user) => user.highestRoleRank > highestRoleRank);
	}

	let selectedUser;
	if (searchParams?.["edit-roles"]) {
		const prismaUser = await prisma.user
			.findFirstOrThrow({
				where: { id: searchParams?.["edit-roles"] },
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
	if (searchParams?.["unafilliate-student"]) {
		const prismaUser = await prisma.user
			.findFirst({ where: { id: searchParams["unafilliate-student"] }, include: { ...generateUserDataObject() } })
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

	if (searchParams?.["create-user"]) {
		schools = await prisma.school.findMany({ orderBy: { name: "asc" }, include: { location: true } }).catch();
	}

	if (searchParams?.["delete-user"]) {
		if (!authorize(authSession, [s.management])) return;
		const prismaUser = await prisma.user
			.findFirst({ where: { id: searchParams["delete-user"] }, include: { ...generateUserDataObject() } })
			.catch(() => {
				return;
			});
		const userData = generateUserData(prismaUser);

		if (userData && !(userData.highestRoleRank > highestRoleRank)) return;
		selectedUser = userData;
	}

	return (
		<>
			{selectedUser && <DeleteUserModal selectedUser={selectedUser} />}
			{!!schools?.length && <CreateUserModal schools={schools} />}
			<EditRolesModal selectedUser={selectedUser} highestRoleRank={highestRoleRank} />
			<AddRolesModal selectedUsers={assignUsers} schools={schools} sessions={sessions} committees={committees} departments={departments} />
			<EditUserModal studentSchoolId={editUserData?.schoolId} edit={filteredAllowedEditUserData} schools={schools} />
			<UnafilliateStudentModal userId={unafilliateStudent.userId} fullName={unafilliateStudent.fullName} />
		</>
	);
}
