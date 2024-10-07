"use server";

import { auth } from "@/auth";
import { countries } from "@/data/countries";
import { authorize, authorizeSchoolDirectorSchool, s } from "@/lib/authorize";
import prisma from "@/prisma/client";

export async function submitDelegationDeclaration(selectedSchoolId: string, numberOfGADelegations, preferredCountriesArray) {
	const authSession = await auth();

	if (!authorizeSchoolDirectorSchool(authSession.user.currentRoles, selectedSchoolId)) {
		return { ok: false, message: "Unauthorized" };
	}

	const selectedSession = await prisma.session.findFirst({ where: { isCurrent: true }, include: { committee: true } });
	const selectedSchool = await prisma.school.findFirst({ where: { id: selectedSchoolId } });

	const areAllCountriesValid =
		preferredCountriesArray.filter((country) => {
			return countries.find((c) => c.countryCode === country);
		}).length === 10;

	if (!areAllCountriesValid) {
		return { ok: false, message: "Invalid country data." };
	}

	if (preferredCountriesArray.length !== 10) {
		return { ok: false, message: "Please select 10 countries." };
	}

	//if the number of req delegations is bigger than allowed error

	if (selectedSession.maxNumberOfGeneralAssemblyDelegationsPerSchool < numberOfGADelegations && selectedSchool?.name !== "The English School") {
		return { ok: false, message: "Number of delegations exceeds the session limit." };
	}

	try {
		const delegationDeclaration = await prisma.applicationDelegationPreferences.create({
			data: {
				schoolId: selectedSchool.id,
				sessionId: selectedSession.id,
				numberOfGACountries: numberOfGADelegations,
				countyPreferences: preferredCountriesArray,
			},
		});
	} catch (e) {
		return { ok: false, message: "Error submitting delegation declaration." };
	}

	return { ok: true, message: "Delegation declaration submitted." };
}

export async function delegationPeopleAssignment(assignment, schoolId, sessId) {
	const authSession = await auth();
	const isAuthorized = authorizeSchoolDirectorSchool(authSession.user.currentRoles, schoolId) || authorize(authSession, [s.management]);

	const selectedSchool = await prisma.school.findFirst({ where: { id: schoolId } });
	const selectedSession = await prisma.session.findFirst({ where: { id: sessId }, include: { committee: true } });

	if (!isAuthorized) return { ok: false, message: ["Unauthorized"] };
	if (!selectedSchool) return { ok: false, message: ["School not found."] };
	if (!selectedSession) return { ok: false, message: ["Session not found."] };

	const delegationGrantedToSchool = await prisma.applicationGrantedDelegationCountries.findFirst({
		where: { schoolId: schoolId, sessionId: sessId },
	});

	const studentIds = assignment.map((a) => a.studentId);
	const students = await prisma.user.findMany({ where: { id: { in: studentIds } } });
	const studentSchoolIds = students.map((s) => s.schoolId);

	if (studentSchoolIds.some((id) => id !== schoolId))
		return { ok: false, message: ["Some students are not students of the school you are trying to assign them to."] };

	if (students.length !== studentIds.length) return { ok: false, message: ["Some students do not exist."] };

	const committeeIds = assignment.map((a) => a.committeeId);
	const uniqueCommitteeIds = [...new Set(committeeIds)];
	const committees = await prisma.committee.findMany({ where: { id: { in: committeeIds } } });

	if (committees.length !== uniqueCommitteeIds.length) return { ok: false, message: ["Some committees do not exist."] };
	if (committees.some((c) => c.sessionId !== sessId)) return { ok: false, message: ["Some committees are not in the session."] };

	const gaCommittees = committees.filter((c) => c.type === "GENERALASSEMBLY");
	const nonGaCommittees = committees.filter((c) => c.type !== "GENERALASSEMBLY");

	const gaCommitteeIds = gaCommittees.map((c) => c.id);
	const nonGaCommitteeIds = nonGaCommittees.map((c) => c.id);

	const gaAssignment = assignment.filter((a) => gaCommitteeIds.includes(a.committeeId));
	const nonGaAssignment = assignment.filter((a) => nonGaCommitteeIds.includes(a.committeeId));

	const gaCountryCodes = gaAssignment.map((a) => a.countryCode);
	const nonGaCountryCodes = nonGaAssignment.map((a) => a.countryCode);

	if (gaCountryCodes.some((c) => !c)) return { ok: false, message: ["General Assembly committees should have a country code."] };
	if (nonGaCountryCodes.some((c) => c)) return { ok: false, message: ["Non-General Assembly committees should not have a country code."] };

	const countries = assignment.map((a) => a.countryCode).filter((c) => c);

	const countriesOfSession = selectedSession.countriesOfSession;

	if (countries.some((c) => !countriesOfSession.includes(c))) return { ok: false, message: ["Some countries are not part of the session."] };

	if (delegationGrantedToSchool) {
		const grantedCountries = delegationGrantedToSchool.countries;
		const countriesNotGranted = countries.filter((c) => !grantedCountries.includes(c));

		if (countriesNotGranted.length > 0) {
			return { ok: false, message: ["Some countries are not part of the granted delegation."] };
		}
	}

	try {
		await prisma.schoolDelegationProposal.create({
			data: {
				schoolId: schoolId,
				sessionId: sessId,
				assignment: JSON.stringify(assignment),
			},
		});
	} catch (e) {
		return { ok: false, message: ["Error creating delegation proposal."] };
	}

	return { ok: true, message: ["Delegation proposal created."] };
}
