"use server";

import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";

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

	console.log(itemsJson);

	//totalAmount should be .toFixed(2) to ensure it is a string with 2 decimal places

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
