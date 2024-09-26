"use server";

import { auth } from "@/auth";
import { permamentSCMembers } from "@/data/constants";
import { countries } from "@/data/countries";
import { authorize, authorizePerSession, s } from "@/lib/authorize";
import { parseFormData } from "@/lib/form";
import { entityCase } from "@/lib/text";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import prisma from "@/prisma/client";
import { z } from "zod";

const currentSessionSchema = z.object({
	theme: z
		.string()
		.trim()
		.min(2, "Theme must be at least 2 characters long")
		.max(50, "Theme must be at most 50 characters long")
		.transform(entityCase),
	subTheme: z
		.string()
		.trim()
		.min(2, "Phrase must be at least 2 characters long")
		.max(50, "Phrase must be at most 50 characters long")
		.transform(entityCase),
});

const sessionSchema = z.object({
	theme: z
		.string()
		.trim()
		.min(2, "Theme must be at least 2 characters long")
		.max(50, "Theme must be at most 50 characters long")
		.transform(entityCase)
		.optional()
		.nullable(),
	subTheme: z
		.string()
		.trim()
		.min(2, "Phrase must be at least 2 characters long")
		.max(50, "Phrase must be at most 50 characters long")
		.transform(entityCase)
		.optional()
		.nullable(),
});

/* description                          String?
welcomeText                          String?
about                                String? */

export async function updateSession(formData: FormData, selectedSessionNumber) {
	const authSession = await auth();

	const prismaUser = await prisma.user.findFirst({
		where: { id: authSession.user.id },
		include: { ...generateUserDataObject() },
	});
	const selectedSession = await prisma.session.findFirst({
		where: {
			number: selectedSessionNumber,
		},
	});
	if (!selectedSession) return { ok: false, message: "Session not found" };
	const userData = generateUserData(prismaUser);
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: "Not Authorized" };

	const { error, data } =
		selectedSession.isVisible || selectedSession.isCurrent || selectedSession.isMainShown
			? currentSessionSchema.safeParse(parseFormData(formData))
			: sessionSchema.safeParse(parseFormData(formData));

	if (error) return { ok: false, message: "Invalid Data" };

	try {
		await prisma.session.update({
			where: { number: selectedSessionNumber },
			data: data,
		});
	} catch {
		return { ok: false, message: "Could not update session." };
	}
	return { ok: true, message: "Session updated." };
}

const textsSchema = z.object({
	welcomeText: z.string().max(500).optional().nullable(),
	description: z.string().max(500).optional().nullable(),
	about: z.string().max(2000).optional().nullable(),
});

export async function updateSessionTexts(formData: FormData, selectedSessionNumber) {
	const authSession = await auth();

	const prismaUser = await prisma.user.findFirst({
		where: { id: authSession.user.id },
		include: { ...generateUserDataObject() },
	});
	const selectedSession = await prisma.session.findFirst({
		where: {
			number: selectedSessionNumber,
		},
	});
	if (!selectedSession) return { ok: false, message: "Session not found" };
	const userData = generateUserData(prismaUser);
	const isManagement = authorize(userData, [s.management]);
	if (!isManagement) return { ok: false, message: "Not Authorized" };

	const { error, data } = textsSchema.safeParse(parseFormData(formData));

	if (error) return { ok: false, message: "Invalid Data" };

	try {
		await prisma.session.update({
			where: { number: selectedSessionNumber },
			data: data,
		});
	} catch {
		return { ok: false, message: "Could not update session." };
	}
	return { ok: true, message: "Session updated." };
}

const currentPricesSchema = z.object({
	delegatePrice: z.number().min(0).max(9999),
	directorPrice: z.number().min(0).max(9999),
});

export async function updateSessionPrices(formData: FormData, selectedSessionNumber) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: "Not Authorized" };

	const selectedSession = await prisma.session.findFirst({
		where: {
			number: selectedSessionNumber,
		},
	});
	if (!selectedSession) return { ok: false, message: "Session not found" };

	if (selectedSession.isPriceLocked) return { ok: false, message: "You can't update the price of a current or fully published session." };

	const parsedFormData = parseFormData(formData);

	const { error, data } = currentPricesSchema.safeParse({
		delegatePrice: parseInt(parsedFormData.delegatePrice),
		directorPrice: parseInt(parsedFormData.directorPrice),
	});

	if (error) return { ok: false, message: "Invalid Data" };

	try {
		await prisma.session.update({
			where: { number: selectedSessionNumber },
			data: data,
		});
	} catch {
		return { ok: false, message: "Could not update session." };
	}
	return { ok: true, message: "Session updated." };
}

export async function setCurrentSession(session) {
	const authSession = await auth();
	let selectedSession, currentSession;
	const isAuthorized = authorize(authSession, [s.admins, s.sd]);
	if (!isAuthorized) return { ok: false, message: "Not authorized." };
	try {
		selectedSession = prisma.session.findFirstOrThrow({
			where: {
				number: session,
			},
		});
	} catch {
		return { ok: false, message: "Session not found." };
	}
	try {
		currentSession = prisma.session.findFirstOrThrow({
			where: {
				isCurrent: true,
			},
		});
	} catch {
		return { ok: false, message: "Current session not found." };
	}

	try {
		await prisma.$transaction([
			prisma.session.update({
				where: { id: selectedSession.id },
				data: { isCurrent: true, isVisible: false, isPartlyVisible: false, isPriceLocked: false },
			}),
			prisma.session.update({
				where: { id: currentSession.id },
				data: {
					isCurrent: false,
					isVisible: true,
					isPartlyVisible: true,
					isMainShown: true,
					isPriceLocked: true,
				},
			}),
		]);
	} catch {
		return { ok: false, message: "Could not set current session." };
	}
	return { ok: true, message: "Session set as current." };
}

export async function setPartiallyVisibleSession(session) {
	const authSession = await auth();
	let selectedSession;
	const isAuthorized = authorize(authSession, [s.admins, s.sd]);
	if (!isAuthorized) return { ok: false, message: "Not authorized." };
	try {
		selectedSession = await prisma.session.findFirstOrThrow({ where: { number: session } });
	} catch {
		return { ok: false, message: "Session not found." };
	}

	if (!selectedSession.theme) return { ok: false, message: "Session theme is not set." };

	const numberOfSessions = await prisma.session.count();

	if (!selectedSession.isCurrent) return { ok: false, message: "Session is not current." };
	if (selectedSession.isPartlyVisible) return { ok: false, message: "Session is already partly visible." };
	if (selectedSession.isVisible) return { ok: false, message: "Session is already fully visible." };
	if (selectedSession.isVisible && !selectedSession.isPartlyVisible)
		return { ok: false, message: `Contact Berzan something is wrong with session ${session}` };
	if ((selectedSession.isVisible || selectedSession.isPartlyVisible) && !selectedSession.isCurrent)
		return { ok: false, message: `Contact Berzan something is wrong with session ${session}` };

	try {
		if (numberOfSessions === 1) {
			try {
				await prisma.session.update({
					where: { id: selectedSession.id },
					data: {
						isCurrent: true,
						isMainShown: true,
						isPriceLocked: true,
						isPartlyVisible: true,
						isVisible: false,
					},
				});
			} catch {
				return { ok: false, message: "Could not set partially visible session." };
			}
			return { ok: true, message: "Session set as fully visible." };
		}

		const currentlyShown = await prisma.session.findFirst({
			where: {
				isMainShown: true,
			},
		});
		if (!currentlyShown) return { ok: false, message: "Currently shown session not found." };
		await prisma.$transaction([
			prisma.session.update({
				where: { id: selectedSession.id },
				data: {
					isCurrent: true,
					isMainShown: true,
					isPriceLocked: true,
					isPartlyVisible: true,
					isVisible: false,
				},
			}),
			prisma.session.update({
				where: { id: currentlyShown.id },
				data: {
					isCurrent: false,
					isPartlyVisible: true,
					isMainShown: false,
					isPriceLocked: true,
				},
			}),
		]);
	} catch (e) {
		return { ok: false, message: "Could not set partially visible session." };
	}
	return { ok: true, message: "Session set as partially visible." };
}

export async function setFullyVisibleSession(session) {
	const authSession = await auth();
	let selectedSession;
	const isAuthorized = authorize(authSession, [s.admins, s.sd]);
	if (!isAuthorized) return { ok: false, message: "Not authorized." };
	try {
		selectedSession = await prisma.session.findFirstOrThrow({
			where: {
				number: session,
			},
		});
	} catch {
		return { ok: false, message: "Session not found." };
	}

	if (!selectedSession.isCurrent) return { ok: false, message: "Session is not current." };
	if (selectedSession.isVisible) return { ok: false, message: "Session is already fully visible." };
	if (!selectedSession.isPartlyVisible) return { ok: false, message: "Session is not partly visible." };

	try {
		await prisma.session.update({
			where: { id: selectedSession.id },
			data: {
				isCurrent: true,
				isPartlyVisible: true,
				isMainShown: true,
				isPriceLocked: true,
				isVisible: true,
			},
		});
	} catch {
		return { ok: false, message: "Could not set fully visible session." };
	}
	return { ok: true, message: "Session set as fully visible." };
}

export async function sessionNumbersChange(formData: FormData, selectedSessionNumber) {
	const schema = z.object({
		maxNumberOfGeneralAssemblyDelegationsPerSchool: z.number().int().min(1).max(99),
		minimumDelegateAgeOnFirstConferenceDay: z.number().int().min(1).max(999),
		maximumDelegateAgeOnFirstConferenceDay: z.number().int().min(1).max(999),
	});

	let selectedSession;
	try {
		selectedSession = await prisma.session.findFirst({
			where: {
				number: selectedSessionNumber,
			},
		});
	} catch {
		return { ok: false, message: "Session not found" };
	}

	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	const parsedFormData = parseFormData(formData);

	const { error, data } = schema.safeParse({
		maxNumberOfGeneralAssemblyDelegationsPerSchool: parseInt(parsedFormData.maxNumberOfGeneralAssemblyDelegationsPerSchool),
		minimumDelegateAgeOnFirstConferenceDay: parseInt(parsedFormData.minimumDelegateAgeOnFirstConferenceDay),
		maximumDelegateAgeOnFirstConferenceDay: parseInt(parsedFormData.maximumDelegateAgeOnFirstConferenceDay),
	});

	if (error) return { ok: false, message: "Invalid Data" };

	if (data.minimumDelegateAgeOnFirstConferenceDay >= data.maximumDelegateAgeOnFirstConferenceDay)
		return { ok: false, message: "Minimum age should be less than maximum age." };

	if (!isManagement) return { ok: false, message: "Not Authorized" };

	try {
		await prisma.session.update({
			where: { number: selectedSession.number },
			data: data,
		});
	} catch (e) {
		return { ok: false, message: "Could not update session." };
	}
	return { ok: true, message: "Session updated." };
}

export async function sessionCountriesChange(formData: FormData, selectedSessionNumber) {
	const gaCountries = formData.get("generalAssemblyCountries");
	const scCountries = formData.get("securityCouncilCountriesOfYear");

	//split with comma or \n
	const separatedGAcountriesList = gaCountries?.split(/,|\n/).map((country) => country.trim());
	const separatedSCcountriesList = scCountries?.split(/,|\n/).map((country) => country.trim());

	//verify from countries list

	const allCountryCodes = countries.map((country) => country.countryCode);
	const permamentSCcountries = countries.filter((country) => country.isPermanentSC).map((country) => country.countryCode);

	const filteredVerifiedGAcountries = separatedGAcountriesList.filter((country) => {
		return allCountryCodes.includes(country);
	});

	const filteredVerifiedSCcountries = separatedSCcountriesList.filter((country) => {
		return allCountryCodes.includes(country);
	});

	const removePermamentSCcountries = filteredVerifiedSCcountries.filter((country) => {
		return !permamentSCMembers.includes(country);
	});

	const addPermamentsBackToTheBeginningSC = permamentSCMembers.concat(removePermamentSCcountries);

	try {
		await prisma.session.update({
			where: { number: selectedSessionNumber },
			data: {
				countriesOfSession: filteredVerifiedGAcountries,
				securityCouncilCountriesOfYear: addPermamentsBackToTheBeginningSC,
			},
		});
	} catch {
		return { ok: false, message: "Could not update session." };
	}
	return { ok: true, message: "Session updated." };
}
