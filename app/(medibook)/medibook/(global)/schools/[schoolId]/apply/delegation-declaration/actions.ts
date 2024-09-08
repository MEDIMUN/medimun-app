"use server";

import { auth } from "@/auth";
import { countries } from "@/data/countries";
import { authorizeSchoolDirectorSchool } from "@/lib/authorize";
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
		}).length === 15;

	if (!areAllCountriesValid) {
		return { ok: false, message: "Invalid country data." };
	}

	if (preferredCountriesArray.length !== 15) {
		return { ok: false, message: "Please select 15 countries." };
	}

	//if the number of req delegations is bigger than allowed error

	if (selectedSession.maxNumberOfGeneralAssemblyDelegationsPerSchool < numberOfGADelegations) {
		return { ok: false, message: "Number of delegations exceeds the session limit." };
	}

	try {
		const delegationDeclaration = await prisma.delegationDeclaration.create({
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
