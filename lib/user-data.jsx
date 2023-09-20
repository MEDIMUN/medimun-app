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
			student: { select: { school: { select: { name: true } } } },
			delegate: { include: { committee: { select: { session: true, name: true } } } },
			chair: { include: { committee: { select: { session: true, name: true, id: true } } } },
			member: { include: { department: { select: { session: true, name: true, id: true } } } },
			manager: { include: { department: { select: { session: true, name: true, id: true } } } },
			schoolDirector: { include: { school: true, session: { select: { isCurrent: true, number: true } } } },
			secretaryGeneral: { include: { session: { select: { isCurrent: true, number: true } } } },
			presidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true } } } },
			deputySecretaryGeneral: { include: { session: { select: { isCurrent: true, number: true } } } },
			deputyPresidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true } } } },
		},
	});

	if (!roles) return null;

	let delegateRole = roles.delegate.map((delegate) => {
		return {
			role: "Delegate",
			committee: delegate.committee.name,
			id: delegate.id,
			country: delegate.country ? delegate.country : "null",
			isCurrent: delegate.committee.session.isCurrent,
			session: delegate.committee.session.number,
		};
	});
	let chairRole = roles.chair.map((chair) => {
		return {
			role: "Chair",
			committee: chair.committee.name,
			committeeId: chair.committee.id,
			isCurrent: chair.committee.session.isCurrent,
			session: chair.committee.session.number,
		};
	});
	let teamMemberRole = roles.member.map((member) => {
		return {
			role: "Member",
			department: member.department.name,
			departmentId: member.department.id,
			isCurrent: member.department.session.isCurrent,
			session: member.session.number,
		};
	});
	let teamManagerRole = roles.manager.map((manager) => {
		return {
			role: "Manager",
			department: manager.department.name,
			departmentId: manager.department.id,
			isCurrent: manager.department.session.isCurrent,
			session: manager.department.session.number,
		};
	});
	let sgRole = roles.secretaryGeneral.map((sg) => {
		return {
			role: "Secretary-General",
			isCurrent: sg.session.isCurrent,
			session: sg.session.number,
		};
	});
	let dsgRole = roles.deputySecretaryGeneral.map((dsg) => {
		return {
			role: "Deputy Secretary-General",
			isCurrent: dsg.session.isCurrent,
			session: dsg.session.number,
		};
	});
	let pgaRole = roles.presidentOfTheGeneralAssembly.map((pga) => {
		return {
			role: "President of the General Assembly",
			isCurrent: pga.session.isCurrent,
			session: pga.session.number,
		};
	});
	let dpgaRole = roles.deputyPresidentOfTheGeneralAssembly.map((dpga) => {
		return {
			role: "Deputy President of the General Assembly",
			isCurrent: dpga.session.isCurrent,
			session: dpga.session.number,
		};
	});
	let schoolDirectorRole = roles.schoolDirector.map((schoolDirector) => {
		return {
			role: "School Director",
			school: schoolDirector.school.name,
			isCurrent: true,
		};
	});
	let seniorDirectorRole = roles.seniorDirecor.map(() => {
		return {
			role: "Senior Director",
			isCurrent: true,
		};
	});
	let globalAdminRole = roles.globalAdmin.map(() => {
		return {
			role: "Global Admin",
			isCurrent: true,
		};
	});
	let adminRole = roles.admin.map(() => {
		return {
			role: "Admin",
			isCurrent: true,
			session: "All",
		};
	});

	let allRoles = [
		...globalAdminRole,
		...adminRole,
		...seniorDirectorRole,
		...sgRole,
		...pgaRole,
		...dsgRole,
		...dpgaRole,
		...schoolDirectorRole,
		...teamManagerRole,
		...chairRole,
		...teamMemberRole,
		...delegateRole,
	];

	let allCurrentRoles = allRoles.filter((role) => role.isCurrent);
	let allPastRoles = allRoles.filter((role) => !role.isCurrent);

	const allFullCurrentRoles = allCurrentRoles.map((role) => {
		return { name: role.role, session: role.session, committee: role.committee, department: role.department, ommitteeId: role.committeeId, departmentId: role.departmentId };
	});

	const allFullPastRoles = allPastRoles.map((role) => {
		return { name: role.role, session: role.session, committee: role.committee, department: role.department, committeeId: role.committeeId, departmentId: role.departmentId };
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
			email: roles.email,
			displayName: roles.displayName,
			schoolName: roles.school ? roles.student.school.name : "null",
			isDisabled: roles.isDisabled,
			nationality: nationality,
			pronoun1: roles.pronoun1,
			pronoun2: roles.pronoun2,
		},
		currentRoles: allFullCurrentRoles,
		pastRoles: allFullPastRoles,
		currentRoleNames: allFilteredCurrentRoles,
		pastRoleNames: allFilteredPastRoles,
	};
}
