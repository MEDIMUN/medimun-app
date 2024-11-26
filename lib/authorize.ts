import { RoleObject } from "@/auth";
import { Session } from "next-auth";

export enum s {
	globalAdmin = "Global Admin",
	admin = "Admin",
	admins = "Admins",
	sd = "Senior Director",
	director = "Director",
	board = "Board",
	sg = "Secretary-General",
	dsg = "Deputy Secretary-General",
	pga = "President of the General Assembly",
	dpga = "Deputy President of the General Assembly",
	sec = "Secretariat",
	highsec = "Higher Secretariat",
	management = "Management",
	chair = "Chair",
	delegate = "Delegate",
	manager = "Manager",
	member = "Member",
	schooldirector = "School Director",
	all = "Everyone",
}

export const authorize = (userdata: Session | null, scope: s[]): boolean => {
	if (!userdata) return false;
	const currentRoleNames = userdata?.user?.currentRoleNames;
	if (!userdata?.user) return false;
	if (userdata?.user.isDisabled) return false;
	if (!currentRoleNames) return false;
	if (!scope[0]) return true;

	for (const sc of scope) {
		if (currentRoleNames.includes("Global Admin")) return true;
		if (currentRoleNames.includes("Admin")) if (sc === s.admin) return true;
		if (currentRoleNames.includes("Admin") || currentRoleNames.includes("Global Admin")) if (sc === s.admins) return true;
		if (currentRoleNames.includes("Senior Director")) if (sc === s.sd) return true;
		if (currentRoleNames.includes("Director")) if (sc === s.director) return true;
		if (currentRoleNames.includes("Senior Director") || currentRoleNames.includes("Director")) if (sc === s.board) return true;
		if (currentRoleNames.includes("Secretary-General")) if (sc === s.sg) return true;
		if (currentRoleNames.includes("Deputy Secretary-General")) if (sc === s.dsg) return true;
		if (currentRoleNames.includes("President of the General Assembly")) if (sc === s.pga) return true;
		if (currentRoleNames.includes("Deputy President of the General Assembly")) if (sc === s.dpga) return true;
		if (
			currentRoleNames.includes("Secretary-General") ||
			currentRoleNames.includes("Deputy Secretary-General") ||
			currentRoleNames.includes("President of the General Assembly") ||
			currentRoleNames.includes("Deputy President of the General Assembly")
		) {
			if (sc === s.sec) return true;
		}
		if (currentRoleNames.includes("Secretary-General") || currentRoleNames.includes("President of the General Assembly")) {
			if (sc === s.highsec) return true;
		}
		if (
			currentRoleNames.includes("Global Admin") ||
			currentRoleNames.includes("Admin") ||
			currentRoleNames.includes("Senior Director") ||
			currentRoleNames.includes("Director") ||
			currentRoleNames.includes("Secretary-General") ||
			currentRoleNames.includes("Deputy Secretary-General") ||
			currentRoleNames.includes("President of the General Assembly") ||
			currentRoleNames.includes("Deputy President of the General Assembly")
		) {
			if (sc === s.management) return true;
		}
		if (currentRoleNames.includes("Chair")) {
			if (sc === s.chair) return true;
		}
		if (currentRoleNames.includes("Delegate")) {
			if (sc === s.delegate) return true;
		}
		if (currentRoleNames.includes("Manager")) {
			if (sc === s.manager) return true;
		}
		if (currentRoleNames.includes("Member")) {
			if (sc === s.member) return true;
		}
		if (currentRoleNames.includes("School Director")) {
			if (sc === s.schooldirector) return true;
		}
	}

	return false;
};

export const authorizeDirect = (userdata: Session | null, scope: s[]): boolean => {
	if (!userdata) return false;
	const { currentRoleNames } = userdata.user;
	if (userdata?.user.isDisabled) return false;
	if (!currentRoleNames) return false;
	if (!scope[0]) return true;

	for (const sc of scope) {
		if (currentRoleNames.includes("Global Admin")) if (sc === s.globalAdmin) return true;
		if (currentRoleNames.includes("Admin")) if (sc === s.admin) return true;
		if (currentRoleNames.includes("Admin") || currentRoleNames.includes("Global Admin")) if (sc === s.admins) return true;
		if (currentRoleNames.includes("Senior Director")) if (sc === s.sd) return true;
		if (currentRoleNames.includes("Director")) if (sc === s.director) return true;
		if (currentRoleNames.includes("Senior Director") || currentRoleNames.includes("Director")) if (sc === s.board) return true;
		if (currentRoleNames.includes("Secretary-General")) if (sc === s.sg) return true;
		if (currentRoleNames.includes("Deputy Secretary-General")) if (sc === s.dsg) return true;
		if (currentRoleNames.includes("President of the General Assembly")) if (sc === s.pga) return true;
		if (currentRoleNames.includes("Deputy President of the General Assembly")) if (sc === s.dpga) return true;
		if (
			currentRoleNames.includes("Secretary-General") ||
			currentRoleNames.includes("Deputy Secretary-General") ||
			currentRoleNames.includes("President of the General Assembly") ||
			currentRoleNames.includes("Deputy President of the General Assembly")
		) {
			if (sc === s.sec) return true;
		}
		if (currentRoleNames.includes("Secretary-General") || currentRoleNames.includes("President of the General Assembly")) {
			if (sc === s.highsec) return true;
		}
		if (
			currentRoleNames.includes("Global Admin") ||
			currentRoleNames.includes("Admin") ||
			currentRoleNames.includes("Senior Director") ||
			currentRoleNames.includes("Director") ||
			currentRoleNames.includes("Secretary-General") ||
			currentRoleNames.includes("Deputy Secretary-General") ||
			currentRoleNames.includes("President of the General Assembly") ||
			currentRoleNames.includes("Deputy President of the General Assembly")
		) {
			if (sc === s.management) return true;
		}
		if (currentRoleNames.includes("Chair")) {
			if (sc === s.chair) return true;
		}
		if (currentRoleNames.includes("Delegate")) {
			if (sc === s.delegate) return true;
		}
		if (currentRoleNames.includes("Manager")) {
			if (sc === s.manager) return true;
		}
		if (currentRoleNames.includes("Member")) {
			if (sc === s.member) return true;
		}
		if (currentRoleNames.includes("School Director")) {
			if (sc === s.schooldirector) return true;
		}
	}

	return false;
};

export function authorizePerRole(userdata: object, scope: s[]): boolean {
	const allRoles = userdata?.user?.currentRoles?.concat(userdata?.user.pastRoles);
	//filter based on conferenceSessions array
	const allRoleIdentifiers = allRoles.map((role) => role.roleIdentifier);
	if (allRoleIdentifiers.includes("globalAdmin") || allRoleIdentifiers.includes("admin")) return true;

	const rolesFilteredPerSession = allRoles.map((role) => role.name);

	for (const sc of scope) {
		if (rolesFilteredPerSession.includes("Global Admin")) return true;
		if (rolesFilteredPerSession.includes("Admin")) if (sc === s.admin) return true;
		if (rolesFilteredPerSession.includes("Admin") || rolesFilteredPerSession.includes("Global Admin")) if (sc === s.admins) return true;
		if (rolesFilteredPerSession.includes("Senior Director")) if (sc === s.sd) return true;
		if (rolesFilteredPerSession.includes("Director")) if (sc === s.director) return true;
		if (rolesFilteredPerSession.includes("Senior Director") || rolesFilteredPerSession.includes("Director")) if (sc === s.board) return true;
		if (rolesFilteredPerSession.includes("Secretary-General")) if (sc === s.sg) return true;
		if (rolesFilteredPerSession.includes("Deputy Secretary-General")) if (sc === s.dsg) return true;
		if (rolesFilteredPerSession.includes("President of the General Assembly")) if (sc === s.pga) return true;
		if (rolesFilteredPerSession.includes("Deputy President of the General Assembly")) if (sc === s.dpga) return true;
		if (
			rolesFilteredPerSession.includes("Secretary-General") ||
			rolesFilteredPerSession.includes("Deputy Secretary-General") ||
			rolesFilteredPerSession.includes("President of the General Assembly") ||
			rolesFilteredPerSession.includes("Deputy President of the General Assembly")
		) {
			if (sc === s.sec) return true;
		}
		if (rolesFilteredPerSession.includes("Secretary-General") || rolesFilteredPerSession.includes("President of the General Assembly")) {
			if (sc === s.highsec) return true;
		}
		if (
			rolesFilteredPerSession.includes("Global Admin") ||
			rolesFilteredPerSession.includes("Admin") ||
			rolesFilteredPerSession.includes("Senior Director") ||
			rolesFilteredPerSession.includes("Director") ||
			rolesFilteredPerSession.includes("Secretary-General") ||
			rolesFilteredPerSession.includes("Deputy Secretary-General") ||
			rolesFilteredPerSession.includes("President of the General Assembly") ||
			rolesFilteredPerSession.includes("Deputy President of the General Assembly")
		) {
			if (sc === s.management) return true;
		}
		if (rolesFilteredPerSession.includes("Chair")) {
			if (sc === s.chair) return true;
		}
		if (rolesFilteredPerSession.includes("Delegate")) {
			if (sc === s.delegate) return true;
		}
		if (rolesFilteredPerSession.includes("Manager")) {
			if (sc === s.manager) return true;
		}
		if (rolesFilteredPerSession.includes("Member")) {
			if (sc === s.member) return true;
		}
		if (rolesFilteredPerSession.includes("School Director")) {
			if (sc === s.schooldirector) return true;
		}
	}

	return false;
}

export function authorizePerSession(userdata: object, scope: s[], conferenceSessions: string[]): boolean {
	const allRoles = userdata?.user?.currentRoles.concat(userdata?.user?.pastRoles);
	//filter based on conferenceSessions array
	if (!allRoles) return false;
	const allRoleIdentifiers = allRoles.map((role) => role.roleIdentifier);
	if (
		allRoleIdentifiers.includes("globalAdmin") ||
		allRoleIdentifiers.includes("admin") ||
		allRoleIdentifiers.includes("seniorDirector") ||
		allRoleIdentifiers.includes("director")
	)
		return true;
	const rolesFilteredPerSessionObjects = allRoles.filter((role) => conferenceSessions.includes(role.session));

	const rolesFilteredPerSession = rolesFilteredPerSessionObjects.map((role) => role.name);

	for (const sc of scope) {
		if (rolesFilteredPerSession.includes("Global Admin")) return true;
		if (rolesFilteredPerSession.includes("Admin")) if (sc === s.admin) return true;
		if (rolesFilteredPerSession.includes("Admin") || rolesFilteredPerSession.includes("Global Admin")) if (sc === s.admins) return true;
		if (rolesFilteredPerSession.includes("Senior Director")) if (sc === s.sd) return true;
		if (rolesFilteredPerSession.includes("Director")) if (sc === s.director) return true;
		if (rolesFilteredPerSession.includes("Senior Director") || rolesFilteredPerSession.includes("Director")) if (sc === s.board) return true;
		if (rolesFilteredPerSession.includes("Secretary-General")) if (sc === s.sg) return true;
		if (rolesFilteredPerSession.includes("Deputy Secretary-General")) if (sc === s.dsg) return true;
		if (rolesFilteredPerSession.includes("President of the General Assembly")) if (sc === s.pga) return true;
		if (rolesFilteredPerSession.includes("Deputy President of the General Assembly")) if (sc === s.dpga) return true;
		if (
			rolesFilteredPerSession.includes("Secretary-General") ||
			rolesFilteredPerSession.includes("Deputy Secretary-General") ||
			rolesFilteredPerSession.includes("President of the General Assembly") ||
			rolesFilteredPerSession.includes("Deputy President of the General Assembly")
		) {
			if (sc === s.sec) return true;
		}
		if (rolesFilteredPerSession.includes("Secretary-General") || rolesFilteredPerSession.includes("President of the General Assembly")) {
			if (sc === s.highsec) return true;
		}
		if (
			rolesFilteredPerSession.includes("Global Admin") ||
			rolesFilteredPerSession.includes("Admin") ||
			rolesFilteredPerSession.includes("Senior Director") ||
			rolesFilteredPerSession.includes("Director") ||
			rolesFilteredPerSession.includes("Secretary-General") ||
			rolesFilteredPerSession.includes("Deputy Secretary-General") ||
			rolesFilteredPerSession.includes("President of the General Assembly") ||
			rolesFilteredPerSession.includes("Deputy President of the General Assembly")
		) {
			if (sc === s.management) return true;
		}
		if (rolesFilteredPerSession.includes("Chair")) {
			if (sc === s.chair) return true;
		}
		if (rolesFilteredPerSession.includes("Delegate")) {
			if (sc === s.delegate) return true;
		}
		if (rolesFilteredPerSession.includes("Manager")) {
			if (sc === s.manager) return true;
		}
		if (rolesFilteredPerSession.includes("Member")) {
			if (sc === s.member) return true;
		}
		if (rolesFilteredPerSession.includes("School Director")) {
			if (sc === s.schooldirector) return true;
		}
	}

	return false;
}

export const authorizeChairDelegate = (chairsRoles: RoleObject[], delegatesRoles: RoleObject[]): boolean => {
	if (!chairsRoles || !delegatesRoles) return false;
	const chairRoles = chairsRoles.filter((role) => role.roleIdentifier === "chair");
	const delegateRoles = delegatesRoles.filter((role) => role.roleIdentifier === "delegate");
	return chairRoles.some((chairRole) => delegateRoles.some((delegateRole) => chairRole.committeeId === delegateRole.committeeId));
};

export const authorizeManagerMember = (managersRoles: RoleObject[], membersRoles: RoleObject[]): boolean => {
	if (!managersRoles || !membersRoles) return false;
	const managerRoles = managersRoles.filter((role) => role.roleIdentifier === "manager");
	const memberRoles = membersRoles.filter((role) => role.roleIdentifier === "member");
	return managerRoles.some((managerRole) => memberRoles.some((memberRole) => managerRole.departmentId === memberRole.departmentId));
};

export const authorizeStudentSchool = (user: any, schoolId: string): boolean => {
	if (!user) return false;
	const userSchoolId = user?.schoolId;
	if (userSchoolId === schoolId) return true;
	return false;
};
export const authorizeSchoolDirectorStudent = (schoolDirectorsRoles: RoleObject[], studentUser: any): boolean => {
	if (!schoolDirectorsRoles || !studentUser) return false;
	const schoolDirectorRoles = schoolDirectorsRoles.filter((role) => role.roleIdentifier === "schoolDirector");
	const studentSchoolId = studentUser?.schoolId;
	return schoolDirectorRoles.some((role) => role.schoolId === studentSchoolId);
};

export const authorizeChairCommittee = (chairsRoles: RoleObject[], committeeId: string): boolean => {
	if (!chairsRoles) return false;
	const chairRoles = chairsRoles.filter((role) => role.roleIdentifier === "chair");
	return chairRoles.some((role) => role.committeeId === committeeId);
};

export const authorizeDelegateCommittee = (delegatesRoles: RoleObject[], committeeId: string): boolean => {
	if (!delegatesRoles) return false;
	const delegateRoles = delegatesRoles.filter((role) => role.roleIdentifier === "delegate");
	return delegateRoles.some((role) => role.committeeId === committeeId);
};

export const authorizeManagerDepartment = (managersRoles: RoleObject[], departmentId: string): boolean => {
	if (!managersRoles) return false;
	const managerRoles = managersRoles.filter((role) => role.roleIdentifier === "manager");
	return managerRoles.some((role) => role.departmentId === departmentId);
};

export const authorizeMemberDepartment = (membersRoles: RoleObject[], departmentId: string): boolean => {
	if (!membersRoles) return false;
	const memberRoles = membersRoles.filter((role) => role.roleIdentifier === "member");
	return memberRoles.some((role) => role.departmentId === departmentId);
};

export const authorizeSchoolDirectorSchool = (schoolDirectorsRoles: RoleObject[], schoolId: string): boolean => {
	if (!schoolDirectorsRoles) return false;
	const schoolDirectorRoles = schoolDirectorsRoles.filter((role) => role.roleIdentifier === "schoolDirector");
	const isValid = schoolDirectorRoles.some((role) => role.schoolId === schoolId);
	return isValid;
};
