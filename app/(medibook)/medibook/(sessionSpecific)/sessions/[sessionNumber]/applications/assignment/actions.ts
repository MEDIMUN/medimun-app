"use server";

import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { sortProposal } from "./page";

export async function delegationAssignmentChanges(proposalId, newAssignment) {
	const authSession = await auth();
	const isAuthorized = authSession && authorize(authSession, [s.management]);
	if (!isAuthorized) return { ok: false, message: ["Unauthorized"] };

	const selectedProposal = await prisma.schoolDelegationProposal.findFirst({
		where: { id: proposalId },
		include: {
			school: { include: { finalDelegation: true, ApplicationGrantedDelegationCountries: true } },
			session: { include: { committee: true } },
		},
	});

	const selectedSchool = selectedProposal?.school;
	const selectedSession = selectedProposal?.session;
	const delegationGrantedToSchool = selectedSchool?.ApplicationGrantedDelegationCountries[0];

	if (!selectedProposal) return { ok: false, message: ["Proposal not found."] };
	if (!isAuthorized) return { ok: false, message: ["Unauthorized"] };
	if (!selectedSchool) return { ok: false, message: ["School not found."] };
	if (!selectedSession) return { ok: false, message: ["Session not found."] };
	if (!delegationGrantedToSchool) return { ok: false, message: ["No delegation granted to the school."] };
	if (selectedSchool.finalDelegation.length > 0) return { ok: false, message: ["Delegation already exists."] };

	const schoolId = selectedSchool.id;

	const studentIds = newAssignment.map((a) => a.studentId);
	const students = await prisma.user.findMany({ where: { id: { in: studentIds } } });
	const studentSchoolIds = students.map((s) => s.schoolId);

	if (studentSchoolIds.some((id) => id !== schoolId))
		return { ok: false, message: ["Some students are not students of the school you are trying to assign them to."] };

	if (students.length !== studentIds.length) return { ok: false, message: ["Some students do not exist."] };

	const committeeIds = newAssignment.map((a) => a.committeeId);
	const uniqueCommitteeIds = [...new Set(committeeIds)];
	const committees = await prisma.committee.findMany({ where: { id: { in: committeeIds } } });

	if (committees.length !== uniqueCommitteeIds.length) return { ok: false, message: ["Some committees do not exist."] };
	if (committees.some((c) => c.sessionId !== selectedSession.id)) return { ok: false, message: ["Some committees are not in the session."] };

	const gaCommittees = committees.filter((c) => c.type === "GENERALASSEMBLY");
	const nonGaCommittees = committees.filter((c) => c.type !== "GENERALASSEMBLY");

	const gaCommitteeIds = gaCommittees.map((c) => c.id);
	const nonGaCommitteeIds = nonGaCommittees.map((c) => c.id);

	const gaAssignment = newAssignment.filter((a) => gaCommitteeIds.includes(a.committeeId));
	const nonGaAssignment = newAssignment.filter((a) => nonGaCommitteeIds.includes(a.committeeId));

	const gaCountryCodes = gaAssignment.map((a) => a.countryCode);
	const nonGaCountryCodes = nonGaAssignment.map((a) => a.countryCode);

	if (gaCountryCodes.some((c) => !c)) return { ok: false, message: ["General Assembly committees should have a country code."] };
	if (nonGaCountryCodes.some((c) => c)) return { ok: false, message: ["Non-General Assembly committees should not have a country code."] };

	const countries = newAssignment.map((a) => a.countryCode).filter((c) => c);

	const countriesOfSession = selectedSession.countriesOfSession;

	if (countries.some((c) => !countriesOfSession.includes(c))) return { ok: false, message: ["Some countries are not part of the session."] };

	if (delegationGrantedToSchool) {
		const grantedCountries = delegationGrantedToSchool.countries;
		const countriesNotGranted = countries.filter((c) => !grantedCountries.includes(c));
		if (countriesNotGranted.length > 0) {
			return { ok: false, message: ["Some countries are not part of the granted delegation."] };
		}
	}

	const generalAssemblyCommitties = selectedSession.committee.filter((committee) => committee.type === "GENERALASSEMBLY");
	const specialAndSecurityCommitties = selectedSession.committee.filter((committee) => committee.type !== "GENERALASSEMBLY");
	const generalAssemblyCountries = delegationGrantedToSchool?.countries?.filter((country) => country !== "NOTGRANTED");

	const maxNumberOfDelegates = generalAssemblyCommitties?.length * generalAssemblyCountries?.length + specialAndSecurityCommitties?.length;
	const minNumberOfDelegates = generalAssemblyCommitties.length * (generalAssemblyCountries.length - 1) + 1;

	if (newAssignment.length < minNumberOfDelegates || newAssignment.length > maxNumberOfDelegates) {
		return { ok: false, message: ["Invalid number of delegates."] };
	}

	const validatedNewAssignment = sortProposal(
		newAssignment.map((a: { countryCode: any; studentId: any; committeeId: any }) => {
			const country = a.countryCode ? a.countryCode : null;
			return { studentId: a.studentId, committeeId: a.committeeId, ...(country ? { countryCode: country } : {}) };
		}),
		committees
	);

	const assignmentArray = JSON.parse(selectedProposal.assignment);

	function isEqual(obj1: { studentId: any; committeeId: any; countryCode: any }, obj2: { studentId: any; committeeId: any; countryCode: any }) {
		return obj1.studentId === obj2.studentId && obj1.committeeId === obj2.committeeId && obj1.countryCode === obj2.countryCode;
	}

	const areSame = validatedNewAssignment.every((a) => assignmentArray.some((b) => isEqual(a, b)));
	const parsedOriginalAssignment = JSON.parse(selectedProposal.assignment);
	try {
		await prisma.schoolDelegationProposal.update({
			data: {
				changes: areSame && validatedNewAssignment.length == parsedOriginalAssignment.length ? null : JSON.stringify(validatedNewAssignment),
				...(!!selectedProposal?.assignment.length && {
					assignment: JSON.stringify(sortProposal(parsedOriginalAssignment, committees)),
				}),
			},
			where: { id: proposalId },
		});
	} catch (e) {
		console.log(e);
		return { ok: false, message: ["Error modifying delegation proposal."] };
	}

	return { ok: true, message: ["Delegation proposal modified."] };
}

export async function getStudentsOfSchool(schoolId, search, excludeList) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!authSession || !isManagement) return { ok: false, message: ["Unauthorized."], data: null };
	const query = search.trim() || "";
	let students;
	try {
		students = await prisma.user.findMany({
			where: {
				OR: [
					{ officialName: { contains: query, mode: "insensitive" } },
					{ officialSurname: { contains: query, mode: "insensitive" } },
					{ id: { contains: query, mode: "insensitive" } },
					{ email: { contains: query, mode: "insensitive" } },
				],
				id: { notIn: excludeList },
				schoolId: schoolId,
			},
			orderBy: { officialName: "asc" },
			take: 10,
		});
	} catch (e) {
		return { ok: false, message: ["Error fetching students."], data: null };
	}

	return { ok: true, message: ["Students found."], data: { students } };
}

export async function handleFinalAssignDelegates(filteredAssignments, selectedSessionId, schoolId) {
	const selectedSession = await prisma.session.findFirst({ where: { id: selectedSessionId } });

	if (!selectedSession) return { ok: false, message: ["Session not found."] };

	const selectedSchool = await prisma.school.findFirst({
		where: { id: schoolId },
		include: {
			_count: {
				select: {
					ApplicationSchoolDirector: {
						where: {
							session: { id: selectedSession.id },
							isApproved: true,
						},
					},
				},
			},
		},
	});

	if (!selectedSchool) return { ok: false, message: ["School not found."] };

	const grantedDelegation = await prisma.applicationDelegationPreferences.findFirst({
		where: { schoolId: schoolId, sessionId: selectedSessionId },
	});

	const allStudentIds = filteredAssignments.map((a) => a.studentId);
	const allCommitteeIds = filteredAssignments.map((a) => a.committeeId);
	const allUniqueCommitteeIds = [...new Set(allCommitteeIds)];
	const allCountryCodes = filteredAssignments.map((a) => a.countryCode);

	const allUsers = await prisma.user.findMany({ where: { id: { in: allStudentIds } } });
	const allCommittees = await prisma.committee.findMany({ where: { id: { in: allCommitteeIds } } });
	const allCountries = selectedSession.countriesOfSession;

	if (allUsers.length !== allStudentIds.length) return { ok: false, message: ["Some users do not exist."] };
	if (allCommittees.length !== allUniqueCommitteeIds.length) return { ok: false, message: ["Some committees do not exist."] };

	//verify if all countries are valid
	if (allCountryCodes.some((c) => c && !allCountries.includes(c))) return { ok: false, message: ["Some countries are not part of the session."] };

	const finalDelegationExists = await prisma.finalDelegation.findFirst({
		where: {
			schoolId: schoolId,
			sessionId: selectedSessionId,
		},
	});

	if (finalDelegationExists) {
		return { ok: false, message: ["Delegation already exists."] };
	}

	const itemsObject = [
		{
			description: "Delegate Fee",
			amount: selectedSession.delegatePrice,
			quantity: filteredAssignments.length,
		},
		{
			description: "School Director Fee",
			amount: selectedSession.directorPrice,
			quantity: selectedSchool._count.ApplicationSchoolDirector,
		},
	];

	const itemsJson = JSON.stringify(itemsObject);

	return { ok: false, message: ["School not found."] };

	try {
		await prisma.$transaction([
			...filteredAssignments.map((a) =>
				prisma.delegate.upsert({
					where: {
						userId_committeeId: {
							userId: a.studentId,
							committeeId: a.committeeId,
						},
					},
					update: {
						country: a.countryCode ? a.countryCode : null,
					},
					create: {
						userId: a.studentId,
						committeeId: a.committeeId,
						country: a.countryCode ? a.countryCode : null,
					},
				})
			),
			prisma.finalDelegation.upsert({
				where: {
					schoolId_sessionId: {
						schoolId: schoolId,
						sessionId: selectedSessionId,
					},
				},
				update: {
					delegation: JSON.stringify(filteredAssignments),
				},
				create: {
					schoolId: schoolId,
					sessionId: selectedSessionId,
					delegation: JSON.stringify(filteredAssignments),
				},
			}),
			prisma.invoice.create({
				data: {
					schoolId: selectedSchool.id,
					sessionId: selectedSessionId,
					items: itemsJson,
					description: "Delegation Fee",
				},
			}),
		]);
	} catch (e) {
		return { ok: false, message: ["Error saving delegations."] };
	}

	return { ok: true, message: ["Delegates assigned."] };
}
