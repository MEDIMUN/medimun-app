import { RoleName, RoleObject } from "@/auth";
import { roleRanks } from "@/data/constants";
import { countries } from "@/data/countries";
import prisma from "@/prisma/client";

export async function getSingleUserData(user) {}

export function generateUserDataObject(obj = {}) {
	const userDataObject = {
		globalAdmin: true,
		admin: true,
		seniorDirector: true,
		Director: true,
		Student: true,
		delegate: { include: { committee: { select: { session: true, name: true, id: true, slug: true } } } },
		chair: { include: { committee: { select: { session: true, name: true, id: true, slug: true } } } },
		member: { include: { department: { select: { session: true, name: true, id: true, slug: true, type: true } } } },
		manager: { include: { department: { select: { session: true, name: true, id: true, slug: true, type: true } } } },
		schoolDirector: { include: { school: true, session: { select: { isCurrent: true, number: true, id: true } } } },
		secretaryGeneral: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
		presidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
		deputySecretaryGeneral: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
		deputyPresidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
	};

	return userDataObject;
}

export function generateUserData(userObject) {
	const allCurrentRoleranks = [];
	if (!userObject) return null;

	let delegateRole = userObject.delegate.map((delegate) => {
		const roleName = "Delegate";
		const shortRoleName = "Delegate";
		const roleIdentifier = "delegate";
		if (delegate.committee.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			committee: delegate.committee.name,
			committeeId: delegate.committee.id,
			committeeSlug: delegate.committee.slug,
			country: delegate.country ? delegate.country : "null",
			isCurrent: delegate.committee.session.isCurrent,
			session: delegate.committee.session.number,
			sessionId: delegate.committee.session.id,
		};
	});
	let chairRole = userObject.chair.map((chair) => {
		const roleName = "Chair";
		const shortRoleName = "Chair";
		const roleIdentifier = "chair";
		if (chair.committee.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			committee: chair.committee.name,
			committeeId: chair.committee.id,
			committeeSlug: chair.committee.slug,
			session: chair.committee.session.number,
			sessionId: chair.committee.session.id,
			isCurrent: chair.committee.session.isCurrent,
		};
	});
	let teamMemberRole = userObject.member.map((member) => {
		const roleName = "Member";
		const shortRoleName = "Member";
		const roleIdentifier = "member";
		if (member.department.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			department: member.department.name,
			departmentId: member.department.id,
			deparmentSlug: member.department.slug,
			departmentType: member.department.type,
			isCurrent: member.department.session.isCurrent,
			session: member.department.session.number,
			sessionId: member.department.session.id,
		};
	});
	let teamManagerRole = userObject.manager.map((manager) => {
		const roleName = "Manager";
		const shortRoleName = "Manager";
		const roleIdentifier = "manager";
		if (manager.department.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			department: manager.department.name,
			departmentId: manager.department.id,
			deparmentSlug: manager.department.slug,
			departmentType: manager.department.type,
			isCurrent: manager.department.session.isCurrent,
			session: manager.department.session.number,
			sessionId: manager.department.session.id,
		};
	});
	let sgRole = userObject.secretaryGeneral.map((sg) => {
		const roleName = "Secretary-General";
		const shortRoleName = "SG";
		const roleIdentifier = "secretaryGeneral";
		if (sg.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: sg.session.isCurrent,
			session: sg.session.number,
			sessionId: sg.session.id,
		};
	});
	let dsgRole = userObject.deputySecretaryGeneral.map((dsg) => {
		const roleName = "Deputy Secretary-General";
		const shortRoleName = "DSG";
		const roleIdentifier = "deputySecretaryGeneral";
		if (dsg.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: dsg.session.isCurrent,
			session: dsg.session.number,
			sessionId: dsg.session.id,
		};
	});
	let pgaRole = userObject.presidentOfTheGeneralAssembly.map((pga) => {
		const roleName = "President of the General Assembly";
		const shortRoleName = "PGA";
		const roleIdentifier = "presidentOfTheGeneralAssembly";
		if (pga.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: pga.session.isCurrent,
			session: pga.session.number,
			sessionId: pga.session.id,
		};
	});
	let dpgaRole = userObject.deputyPresidentOfTheGeneralAssembly.map((dpga) => {
		const roleName = "Vice President of the General Assembly";
		const shortRoleName = "VPGA";
		const roleIdentifier = "vicePresidentOfTheGeneralAssembly";
		if (dpga.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: dpga.session.isCurrent,
			session: dpga.session.number,
			sessionId: dpga.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let schoolDirectorRole = userObject.schoolDirector.map((schoolDirector) => {
		const roleName = "School Director";
		const shortRoleName = "School Director";
		const roleIdentifier = "schoolDirector";
		if (schoolDirector.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			school: schoolDirector.school.name,
			schoolId: schoolDirector.school.id,
			schoolSlug: schoolDirector.school.slug,
			isCurrent: true,
			session: schoolDirector.session.number,
			sessionId: schoolDirector.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let directorRole = userObject.seniorDirector.map(() => {
		const roleName = "Director";
		const shortRoleName = "Director";
		const roleIdentifier = "director";
		allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: true,
			roleIdentifier: roleIdentifier,
		};
	});
	let seniorDirectorRole = userObject.seniorDirector.map(() => {
		const roleName = "Senior Director";
		const shortRoleName = "Senior Director";
		const roleIdentifier = "seniorDirector";
		allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: true,
			roleIdentifier: roleIdentifier,
		};
	});
	let adminRole = userObject.admin.map(() => {
		const roleName = "Admin";
		const shortRoleName = "Admin";
		const roleIdentifier = "admin";
		allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: true,
			roleIdentifier: roleIdentifier,
		};
	});
	let globalAdminRole = userObject.globalAdmin.map(() => {
		const roleName = "Global Admin";
		const shortRoleName = "Global Admin";
		const roleIdentifier = "globalAdmin";
		allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: true,
			roleIdentifier: roleIdentifier,
		};
	});

	let allRoles = [...globalAdminRole, ...adminRole, ...seniorDirectorRole, ...sgRole, ...pgaRole, ...dsgRole, ...dpgaRole, ...schoolDirectorRole, ...teamManagerRole, ...chairRole, ...teamMemberRole, ...delegateRole];

	let allCurrentRoles = allRoles.filter((role) => role.isCurrent);
	let allPastRoles = allRoles.filter((role) => !role.isCurrent);

	const allFullCurrentRoles = allCurrentRoles.map((role) => {
		return {
			roleIdentifier: role.roleIdentifier,
			shortRole: role.shortRole,
			name: role.role,
			session: role.session,
			sessionId: role.sessionId,
			//
			committee: role.committee,
			committeeId: role.committeeId,
			committeeSlug: role.committeeSlug,
			//
			department: role.department,
			departmentId: role.departmentId,
			deparmentSlug: role.departmentSlug,
			departmentTypes: role.departmentType,
			//
			schoolId: role.schoolId,
			school: role.school,
			schoolSlug: role.schoolSlug,
		};
	});

	const allFullPastRoles = allPastRoles.map((role) => {
		return {
			roleIdentifier: role.roleIdentifier,
			shortRole: role.shortRole,
			name: role.role,
			session: role.session,
			sessionId: role.sessionId,
			//
			committee: role.committee,
			committeeId: role.committeeId,
			committeeSlug: role.committeeSlug,
			//
			department: role.department,
			departmentId: role.departmentId,
			deparmentSlug: role.departmentSlug,
			departmentTypes: role.departmentType,
			//
			schoolId: role.schoolId,
			school: role.school,
			schoolSlug: role.schoolSlug,
		};
	});

	const allFilteredCurrentRoles = allCurrentRoles.map((role) => {
		return role.role;
	});

	const allFilteredPastRoles = allPastRoles.map((role) => {
		return role.role;
	});

	return {
		id: userObject.id,
		officialName: userObject.officialName,
		officialSurname: userObject.officialSurname,
		displayName: userObject.displayName,
		schoolName: userObject.Student ? userObject.Student.name : null,
		schoolId: userObject.Student ? userObject.Student.id : null,
		isDisabled: userObject.isDisabled,
		nationality: userObject.nationality ? userObject.nationality : null,
		pronouns: userObject.pronouns,
		//
		currentRoles: allFullCurrentRoles as RoleObject[],
		currentRoleNames: allFilteredCurrentRoles as RoleName[],
		highestRoleRank: Math.min(...allCurrentRoleranks),
		pastRoles: allFullPastRoles as RoleObject[],
		pastRoleNames: allFilteredPastRoles as RoleName[],
		isDisabled: userObject.isDisabled,
	};
}

export async function userData(user) {
	const roles = await prisma.user.findFirst({
		where: { OR: [{ email: user }, { id: user }, { username: user }] },
		include: {
			globalAdmin: true,
			admin: true,
			seniorDirector: true,
			Director: true,
			Student: true,
			delegate: { include: { committee: { select: { session: true, name: true, id: true, slug: true } } } },
			chair: { include: { committee: { select: { session: true, name: true, id: true, slug: true } } } },
			member: { include: { department: { select: { session: true, name: true, id: true, slug: true, type: true } } } },
			manager: { include: { department: { select: { session: true, name: true, id: true, slug: true, type: true } } } },
			schoolDirector: { include: { school: true, session: { select: { isCurrent: true, number: true, id: true } } } },
			secretaryGeneral: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
			presidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
			deputySecretaryGeneral: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
			deputyPresidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
		},
		omit: { signature: true },
	});

	const allCurrentRoleranks = [];

	if (!roles) return null;

	let delegateRole = roles.delegate.map((delegate) => {
		const roleName = "Delegate";
		const shortRoleName = "Delegate";
		const roleIdentifier = "delegate";
		if (delegate.committee.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			committee: delegate.committee.name,
			committeeId: delegate.committee.id,
			committeeSlug: delegate.committee.slug,
			country: delegate.country ? delegate.country : "null",
			isCurrent: delegate.committee.session.isCurrent,
			session: delegate.committee.session.number,
			sessionId: delegate.committee.session.id,
		};
	});
	let chairRole = roles.chair.map((chair) => {
		const roleName = "Chair";
		const shortRoleName = "Chair";
		const roleIdentifier = "chair";
		if (chair.committee.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			committee: chair.committee.name,
			committeeId: chair.committee.id,
			committeeSlug: chair.committee.slug,
			session: chair.committee.session.number,
			sessionId: chair.committee.session.id,
			isCurrent: chair.committee.session.isCurrent,
		};
	});
	let teamMemberRole = roles.member.map((member) => {
		const roleName = "Member";
		const shortRoleName = "Member";
		const roleIdentifier = "member";
		if (member.department.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			department: member.department.name,
			departmentId: member.department.id,
			deparmentSlug: member.department.slug,
			departmentType: member.department.type,
			isCurrent: member.department.session.isCurrent,
			session: member.department.session.number,
			sessionId: member.department.session.id,
		};
	});
	let teamManagerRole = roles.manager.map((manager) => {
		const roleName = "Manager";
		const shortRoleName = "Manager";
		const roleIdentifier = "manager";
		if (manager.department.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			department: manager.department.name,
			departmentId: manager.department.id,
			deparmentSlug: manager.department.slug,
			deparmentTypes: manager.department.type,
			isCurrent: manager.department.session.isCurrent,
			session: manager.department.session.number,
			sessionId: manager.department.session.id,
		};
	});
	let sgRole = roles.secretaryGeneral.map((sg) => {
		const roleName = "Secretary-General";
		const shortRoleName = "SG";
		const roleIdentifier = "secretaryGeneral";
		if (sg.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: sg.session.isCurrent,
			session: sg.session.number,
			sessionId: sg.session.id,
		};
	});
	let dsgRole = roles.deputySecretaryGeneral.map((dsg) => {
		const roleName = "Deputy Secretary-General";
		const shortRoleName = "DSG";
		const roleIdentifier = "deputySecretaryGeneral";
		if (dsg.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: dsg.session.isCurrent,
			session: dsg.session.number,
			sessionId: dsg.session.id,
		};
	});
	let pgaRole = roles.presidentOfTheGeneralAssembly.map((pga) => {
		const roleName = "President of the General Assembly";
		const shortRoleName = "PGA";
		const roleIdentifier = "presidentOfTheGeneralAssembly";
		if (pga.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			roleIdentifier: roleIdentifier,
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: pga.session.isCurrent,
			session: pga.session.number,
			sessionId: pga.session.id,
		};
	});
	let dpgaRole = roles.deputyPresidentOfTheGeneralAssembly.map((dpga) => {
		const roleName = "Vice President of the General Assembly";
		const shortRoleName = "VPGA";
		const roleIdentifier = "vicePresidentOfTheGeneralAssembly";
		if (dpga.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: dpga.session.isCurrent,
			session: dpga.session.number,
			sessionId: dpga.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let schoolDirectorRole = roles.schoolDirector.map((schoolDirector) => {
		const roleName = "School Director";
		const shortRoleName = "School Director";
		const roleIdentifier = "schoolDirector";
		if (schoolDirector.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			school: schoolDirector.school.name,
			schoolId: schoolDirector.school.id,
			schoolSlug: schoolDirector.school.slug,
			isCurrent: true,
			session: schoolDirector.session.number,
			sessionId: schoolDirector.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let directorRole = roles.seniorDirector.map(() => {
		const roleName = "Director";
		const shortRoleName = "Director";
		const roleIdentifier = "director";
		allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: true,
			roleIdentifier: roleIdentifier,
		};
	});
	let seniorDirectorRole = roles.seniorDirector.map(() => {
		const roleName = "Senior Director";
		const shortRoleName = "Senior Director";
		const roleIdentifier = "seniorDirector";
		allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: true,
			roleIdentifier: roleIdentifier,
		};
	});
	let adminRole = roles.admin.map(() => {
		const roleName = "Admin";
		const shortRoleName = "Admin";
		const roleIdentifier = "admin";
		allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: true,
			roleIdentifier: roleIdentifier,
		};
	});
	let globalAdminRole = roles.globalAdmin.map(() => {
		const roleName = "Global Admin";
		const shortRoleName = "Global Admin";
		const roleIdentifier = "globalAdmin";
		allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: true,
			roleIdentifier: roleIdentifier,
		};
	});

	let allRoles = [...globalAdminRole, ...adminRole, ...seniorDirectorRole, ...sgRole, ...pgaRole, ...dsgRole, ...dpgaRole, ...schoolDirectorRole, ...teamManagerRole, ...chairRole, ...teamMemberRole, ...delegateRole];

	let allCurrentRoles = allRoles.filter((role) => role.isCurrent);
	let allPastRoles = allRoles.filter((role) => !role.isCurrent);

	const allFullCurrentRoles = allCurrentRoles.map((role) => {
		return {
			roleIdentifier: role.roleIdentifier,
			shortRole: role.shortRole,
			name: role.role,
			session: role.session,
			sessionId: role.sessionId,
			//
			committee: role.committee,
			committeeId: role.committeeId,
			committeeSlug: role.committeeSlug,
			//
			department: role.department,
			departmentId: role.departmentId,
			deparmentSlug: role.departmentSlug,
			departmentTypes: role.departmentType,
			//
			schoolId: role.schoolId,
			school: role.school,
			schoolSlug: role.schoolSlug,
		};
	});

	const allFullPastRoles = allPastRoles.map((role) => {
		return {
			roleIdentifier: role.roleIdentifier,
			shortRole: role.shortRole,
			name: role.role,
			session: role.session,
			sessionId: role.sessionId,
			//
			committee: role.committee,
			committeeId: role.committeeId,
			committeeSlug: role.committeeSlug,
			//
			department: role.department,
			departmentId: role.departmentId,
			deparmentSlug: role.departmentSlug,
			departmentTypes: role.departmentType,
			//
			schoolId: role.schoolId,
			school: role.school,
			schoolSlug: role.schoolSlug,
		};
	});

	const allFilteredCurrentRoles = allCurrentRoles.map((role) => {
		return role.role;
	});

	const allFilteredPastRoles = allPastRoles.map((role) => {
		return role.role;
	});

	let sessions = [];

	const nationality = countries.filter((country) => {
		if (country.countryCode === roles.nationality) {
			return country;
		}
	})[0];

	return {
		user: {
			id: roles.id as string,
			officialName: roles.officialName as string,
			officialSurname: roles.officialSurname as string,
			bio: roles.bio as string,
			dateOfBirth: roles.dateOfBirth as Date,
			email: roles.email as string,
			displayName: roles.displayName as string,
			schoolName: roles.Student ? roles.Student.name : (null as string),
			isDisabled: roles.isDisabled as boolean,
			nationality: roles.nationality as string,
			phoneNumber: roles.phoneNumber as string,
			pronouns: roles.pronouns as string,
		},
		currentRoles: allFullCurrentRoles as RoleObject[],
		currentRoleNames: allFilteredCurrentRoles as RoleName[],
		highestRoleRank: Math.min(...allCurrentRoleranks) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
		pastRoles: allFullPastRoles as RoleObject[],
		pastRoleNames: allFilteredPastRoles as RoleName[],
	};
}
