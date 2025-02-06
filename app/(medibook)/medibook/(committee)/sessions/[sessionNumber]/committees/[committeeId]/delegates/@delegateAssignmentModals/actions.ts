"use server";

import prisma from "@/prisma/client";
import { s, authorize, authorizeChairCommittee } from "@/lib/authorize";
import { auth } from "@/auth";
import { z } from "zod";
import { entityCase, processSlug } from "@/lib/text";
import { parseFormData } from "@/lib/parse-form-data";
import { verifyPassword } from "@/lib/password-hash";
import { countries } from "@/data/countries";

export async function editDelegateAssignment({ delegateId, countryCode, committeeId }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	const selectedCommittee = await prisma.committee.findFirst({
		where: { id: committeeId },
		include: { ExtraCountry: true, delegate: true },
	});

	if (!selectedCommittee) return { ok: false, message: ["Committee not found"] };

	const selectedDelegate = await prisma.delegate.findUnique({
		where: { id: delegateId },
		include: { user: true },
	});

	if (!selectedDelegate) return { ok: false, message: ["Delegate not found"] };

	if (selectedCommittee.type === "GENERALASSEMBLY") {
		if (!isManagement) return null;
		const schoolDelegation = await prisma.applicationGrantedDelegationCountries.findFirst({
			where: { school: { User: { some: { id: selectedDelegate.user.id } } } },
		});

		const filteredMainCountries = countries.filter((country) => schoolDelegation?.countries.some((c) => c === country.countryCode));
		const allCountries = filteredMainCountries.concat(selectedCommittee.ExtraCountry);
		const allNoneAssignedCountries = allCountries
			.filter((country) => !selectedCommittee.delegate.some((delegate) => delegate.country === country.countryCode))
			.concat(allCountries.find((country) => country?.countryCode === selectedDelegate?.country));

		if (!allNoneAssignedCountries.some((country) => country?.countryCode === countryCode) && countryCode !== "null") {
			return { ok: false, message: ["Country not found"] };
		}
	}

	if (selectedCommittee.type === "SPECIALCOMMITTEE") {
		const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee.id);
		if (!isManagement && !isChairOfCommittee) return null;
		const allCountries = selectedCommittee.ExtraCountry;
		const allNoneAssignedCountries = allCountries
			.filter((country) => !selectedCommittee.delegate.some((delegate) => delegate.country === country.countryCode))
			.concat(allCountries.find((country) => country?.countryCode === selectedDelegate?.country));
		if (!allNoneAssignedCountries.some((country) => country.countryCode === countryCode) && countryCode !== "null") {
			return { ok: false, message: ["Country not found"] };
		}
	}

	if (selectedCommittee.type === "SECURITYCOUNCIL") {
		const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee.id);
		if (!isManagement && !isChairOfCommittee) return null;
		const allCountries = countries.concat(selectedCommittee.ExtraCountry);
		const allNoneAssignedCountries = allCountries
			.filter((country) => !selectedCommittee.delegate.some((delegate) => delegate.country === country.countryCode))
			.concat(allCountries.find((country) => country?.countryCode === selectedDelegate?.country));
		if (!allNoneAssignedCountries.some((country) => country?.countryCode === countryCode) && countryCode !== "null") {
			return { ok: false, message: ["Country not found"] };
		}
	}
	try {
		await prisma.delegate.update({
			where: { id: delegateId },
			data: { country: countryCode === "null" ? null : countryCode },
		});
	} catch (error) {
		return { ok: false, message: ["Failed to update delegate"] };
	}

	return { ok: true, message: ["Committee updated"] };
}
