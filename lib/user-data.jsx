import { countries } from "@/data/countries";
import prisma from "@client";

export async function userData(user) {
	await prisma.$connect();
	const roles = await prisma.user.findFirst({
		where: { OR: [{ email: user }, { id: user }, { username: user }] },
		include: {
			globalAdmin: true,
			admin: true,
			seniorDirecor: true,
			Director: true,
			student: { select: { school: { select: { name: true } } } },
			delegate: { include: { committee: { select: { session: true, name: true, id: true } } } },
			chair: { include: { committee: { select: { session: true, name: true, id: true } } } },
			member: { include: { department: { select: { session: true, name: true, id: true } } } },
			manager: { include: { department: { select: { session: true, name: true, id: true } } } },
			schoolDirector: { include: { school: true, session: { select: { isCurrent: true, number: true, id: true } } } },
			secretaryGeneral: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
			presidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
			deputySecretaryGeneral: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
			deputyPresidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
		},
	});

	const roleRanks = {
		Delegate: 9,
		"School Director": 8,
		Member: 7,
		Chair: 6,
		Manager: 6,
		"Deputy Secretary-General": 5,
		"Deputy President of the General Assembly": 5,
		"President of the General Assembly": 4,
		"Secretary-General": 4,
		Director: 3,
		"Senior Director": 2,
		Admin: 1,
		"Global Admin": 0,
	};

	const allCurrentRoleranks = [];

	if (!roles) return null;

	let delegateRole = roles.delegate.map((delegate) => {
		const roleName = "Delegate";
		const shortRoleName = "Delegate";
		const roleIdentifier = "delegate";
		if (delegate.committee.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			committee: delegate.committee.name,
			committeeId: delegate.committee.id,
			country: delegate.country ? delegate.country : "null",
			isCurrent: delegate.committee.session.isCurrent,
			session: delegate.committee.session.number,
			sessionId: delegate.committee.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let chairRole = roles.chair.map((chair) => {
		const roleName = "Chair";
		const shortRoleName = "Chair";
		const roleIdentifier = "chair";
		if (chair.committee.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			committee: chair.committee.name,
			committeeId: chair.committee.id,
			isCurrent: chair.committee.session.isCurrent,
			session: chair.committee.session.number,
			sessionId: chair.committee.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let teamMemberRole = roles.member.map((member) => {
		const roleName = "Member";
		const shortRoleName = "Member";
		const roleIdentifier = "member";
		if (member.department.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			department: member.department.name,
			departmentId: member.department.id,
			isCurrent: member.department.session.isCurrent,
			session: member.department.session.number,
			sessionId: member.department.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let teamManagerRole = roles.manager.map((manager) => {
		const roleName = "Manager";
		const shortRoleName = "Manager";
		const roleIdentifier = "manager";
		if (manager.department.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			department: manager.department.name,
			departmentId: manager.department.id,
			isCurrent: manager.department.session.isCurrent,
			session: manager.department.session.number,
			sessionId: manager.department.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let sgRole = roles.secretaryGeneral.map((sg) => {
		const roleName = "Secretary-General";
		const shortRoleName = "SG";
		const roleIdentifier = "secretaryGeneral";
		if (sg.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: sg.session.isCurrent,
			session: sg.session.number,
			sessionId: sg.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let dsgRole = roles.deputySecretaryGeneral.map((dsg) => {
		const roleName = "Deputy Secretary-General";
		const shortRoleName = "DSG";
		const roleIdentifier = "deputySecretaryGeneral";
		if (dsg.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: dsg.session.isCurrent,
			session: dsg.session.number,
			sessionId: dsg.session.id,
			roleIdentifier: roleIdentifier,
		};
	});
	let pgaRole = roles.presidentOfTheGeneralAssembly.map((pga) => {
		const roleName = "President of the General Assembly";
		const shortRoleName = "PGA";
		const roleIdentifier = "presidentOfTheGeneralAssembly";
		if (pga.session.isCurrent) allCurrentRoleranks.push(roleRanks[roleName]);
		return {
			role: roleName,
			shortRole: shortRoleName,
			isCurrent: pga.session.isCurrent,
			session: pga.session.number,
			sessionId: pga.session.id,
			roleIdentifier: roleIdentifier,
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
		return { name: role.role, session: role.session, committee: role.committee, department: role.department, committeeId: role.committeeId, departmentId: role.departmentId, sessionId: role.sessionId, roleIdentifier: role.roleIdentifier, school: role.school, schoolId: role.schoolId };
	});

	const allFullPastRoles = allPastRoles.map((role) => {
		return { name: role.role, session: role.session, committee: role.committee, department: role.department, committeeId: role.committeeId, departmentId: role.departmentId, sessionId: role.sessionId, roleIdentifier: role.roleIdentifier, school: role.school, schoolId: role.schoolId };
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
			schoolName: roles.school ? roles.student.school.name : "null",
			isDisabled: roles.isDisabled,
			nationality: nationality,
			phoneCode: roles.phoneCode,
			phoneNumber: roles.phoneNumber,
			pronoun1: roles.pronoun1,
			pronoun2: roles.pronoun2,
		},
		currentRoles: allFullCurrentRoles,
		currentRoleNames: allFilteredCurrentRoles,
		highestRoleRank: Math.min(...allCurrentRoleranks),
		pastRoles: allFullPastRoles,
		pastRoleNames: allFilteredPastRoles,
	};
}

export async function multipleUserData(users) {
	const allUsers = [];
	for (const user of users) {
		const userData = await userData(user);
		allUsers.push(userData);
	}
	return allUsers;
}
