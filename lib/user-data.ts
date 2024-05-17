import { roleRanks } from "@/constants";
import { countries } from "@/data/countries";
import prisma from "@/prisma/client";

export async function getSingleUserData(user) {}

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
		const roleName = "Deputy President of the General Assembly";
		const shortRoleName = "DPGA";
		const roleIdentifier = "deputyPresidentOfTheGeneralAssembly";
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
			isCurrent: true,
			session: schoolDirector.session.number,
			sessionId: schoolDirector.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let directorRole = userObject.seniorDirecor.map(() => {
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
	let seniorDirectorRole = userObject.seniorDirecor.map(() => {
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
			sessionId: role.sessionId,
			session: role.session,
			committeeId: role.committeeId,
			committee: role.committee,
			departmentId: role.departmentId,
			department: role.department,
			schoolId: role.schoolId,
			school: role.school,
		};
	});

	const allFullPastRoles = allPastRoles.map((role) => {
		return {
			roleIdentifier: role.roleIdentifier,
			shortRole: role.shortRole,
			name: role.role,
			sessionId: role.sessionId,
			session: role.session,
			committeeId: role.committeeId,
			committee: role.committee,
			committeeSlug: role.committeeSlug,
			departmentId: role.departmentId,
			department: role.department,
			departmentSlug: role.departmentSlug,
			schoolId: role.schoolId,
			school: role.school,
		};
	});

	const allFilteredCurrentRoles = allCurrentRoles.map((role) => {
		return role.role;
	});

	const allFilteredPastRoles = allPastRoles.map((role) => {
		return role.role;
	});

	const nationality = countries.filter((country) => {
		if (country.countryCode === userObject.nationality) {
			return country;
		}
	})[0];
	return {
		user: {
			id: userObject.id,
			officialName: userObject.officialName,
			officialSurname: userObject.officialSurname,
			displayName: userObject.displayName,
			schoolName: userObject.Student ? userObject.Student.name : null,
			isDisabled: userObject.isDisabled,
			nationality: nationality,
			pronouns: userObject.pronouns,
		},
		currentRoles: allFullCurrentRoles,
		currentRoleNames: allFilteredCurrentRoles,
		highestRoleRank: Math.min(...allCurrentRoleranks),
		pastRoles: allFullPastRoles,
		pastRoleNames: allFilteredPastRoles,
	};
}

export async function userData(user) {
	const roles = await prisma.user.findFirst({
		where: { OR: [{ email: user }, { id: user }, { username: user }] },
		include: {
			globalAdmin: true,
			admin: true,
			seniorDirecor: true,
			Director: true,
			Student: true,
			delegate: { include: { committee: { select: { session: true, name: true, id: true, slug: true } } } },
			chair: { include: { committee: { select: { session: true, name: true, id: true, slug: true } } } },
			member: { include: { department: { select: { session: true, name: true, id: true, slug: true } } } },
			manager: { include: { department: { select: { session: true, name: true, id: true, slug: true } } } },
			schoolDirector: { include: { school: true, session: { select: { isCurrent: true, number: true, id: true } } } },
			secretaryGeneral: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
			presidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
			deputySecretaryGeneral: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
			deputyPresidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
		},
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
		const roleName = "Deputy President of the General Assembly";
		const shortRoleName = "DPGA";
		const roleIdentifier = "deputyPresidentOfTheGeneralAssembly";
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
			isCurrent: true,
			session: schoolDirector.session.number,
			sessionId: schoolDirector.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let directorRole = roles.seniorDirecor.map(() => {
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
	let seniorDirectorRole = roles.seniorDirecor.map(() => {
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
			sessionId: role.sessionId,
			session: role.session,
			committeeId: role.committeeId,
			committee: role.committee,
			departmentId: role.departmentId,
			department: role.department,
			schoolId: role.schoolId,
			school: role.school,
		};
	});

	const allFullPastRoles = allPastRoles.map((role) => {
		return {
			roleIdentifier: role.roleIdentifier,
			shortRole: role.shortRole,
			name: role.role,
			sessionId: role.sessionId,
			session: role.session,
			committeeId: role.committeeId,
			committee: role.committee,
			committeeSlug: role.committeeSlug,
			departmentId: role.departmentId,
			department: role.department,
			departmentSlug: role.departmentSlug,
			schoolId: role.schoolId,
			school: role.school,
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
			id: roles.id,
			officialName: roles.officialName,
			officialSurname: roles.officialSurname,
			bio: roles.bio,
			dateOfBirth: roles.dateOfBirth,
			email: roles.email,
			displayName: roles.displayName,
			schoolName: roles.Student ? roles.Student.name : null,
			isDisabled: roles.isDisabled,
			nationality: nationality,
			phoneCode: roles.phoneCode,
			phoneNumber: roles.phoneNumber,
			pronouns: roles.pronouns,
		},
		currentRoles: allFullCurrentRoles,
		currentRoleNames: allFilteredCurrentRoles,
		highestRoleRank: Math.min(...allCurrentRoleranks),
		pastRoles: allFullPastRoles,
		pastRoleNames: allFilteredPastRoles,
	};
}
