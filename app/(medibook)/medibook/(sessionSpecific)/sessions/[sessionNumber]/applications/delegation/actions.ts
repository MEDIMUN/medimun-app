"use server";

import { auth } from "@/auth";
import { countries } from "@/data/countries";
import { sendEmailSchoolHasBeenAssignedCountries } from "@/email/send";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";

export async function changeDelegateApplicationStatus(formData, selectedSessionNumber) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const isSeniorDirector = authorize(authSession, [s.sd, s.director, s.admins, s.sg, s.pga]);
	if (!isSeniorDirector) return { ok: false, message: "Unauthorized" };

	const autoOpenTime = formData.get("delegateApplicationsAutoOpenTime");
	const autoCloseTime = formData.get("delegateApplicationsAutoCloseTime");

	const selectedSession = await prisma.session.findUnique({
		where: {
			number: selectedSessionNumber,
		},
	});

	if (!selectedSession) {
		return { ok: false, message: "Session not found" };
	}

	if (!selectedSession.isCurrent) return { ok: false, message: "Session is not current" };

	const res = await prisma.session.update({
		where: {
			number: selectedSessionNumber,
		},
		data: {
			...(autoOpenTime && { delegateApplicationsAutoOpenTime: new Date(autoOpenTime) }),
			...(autoCloseTime && { delegateApplicationsAutoCloseTime: new Date(autoCloseTime) }),
		},
	});

	return { ok: true, message: "Settings updated." };
}

export async function isDelegateApplicationsForceOpenChangeAction(data, selectedSessionNumber) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const isSeniorDirector = authorize(authSession, [s.sd, s.director, s.admins, s.sg, s.pga]);
	if (!isSeniorDirector) return { ok: false, message: "Unauthorized" };

	const selectedSession = await prisma.session.findUnique({
		where: {
			number: selectedSessionNumber,
		},
	});

	if (!selectedSession) {
		return { ok: false, message: "Session not found" };
	}

	if (!selectedSession.isCurrent) return { ok: false, message: "Session is not current" };

	const res = await prisma.session.update({
		where: {
			number: selectedSessionNumber,
		},
		data: {
			isDelegateApplicationsForceOpen: data,
		},
	});

	return { ok: true, message: "Settings updated." };
}

export async function isDelegateApplicationsAutoOpenChangeAction(data, selectedSessionNumber) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const isSeniorDirector = authorize(authSession, [s.sd, s.director, s.admins, s.sg, s.pga]);
	if (!isSeniorDirector) return { ok: false, message: "Unauthorized" };

	const selectedSession = await prisma.session.findUnique({
		where: {
			number: selectedSessionNumber,
		},
	});

	if (!selectedSession) {
		return { ok: false, message: "Session not found" };
	}

	if (!selectedSession.isCurrent) return { ok: false, message: "Session is not current" };

	const res = await prisma.session.update({
		where: {
			number: selectedSessionNumber,
		},
		data: {
			isDelegateApplicationsAutoOpen: data,
		},
	});

	return { ok: true, message: "Settings updated." };
}

export async function acceptDelegationDeclaration(schoolId: string, schoolCountries: string[], sessionId: string) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const isDirector = authorize(authSession, [s.sd, s.director, s.admins, s.sg, s.pga]);
	if (!isDirector) return { ok: false, message: "Unauthorized" };

	const allValidCountries = countries.map((c) => c.countryCode);
	const selectedSession = await prisma.session.findFirst({
		where: { id: sessionId },
		include: { ApplicationGrantedDelegationCountries: true },
	});

	if (!selectedSession) return { ok: false, message: "No current session found." };

	const validStringCountries = schoolCountries
		.filter((c) => c)
		.filter((c) => c === "NOTGRANTED" || (selectedSession.countriesOfSession.includes(c) && allValidCountries.includes(c)))
		.sort((a, b) => (a === "NOTGRANTED" ? 1 : b === "NOTGRANTED" ? -1 : 0));
	if (!validStringCountries.length) return { ok: false, message: ["No valid countries chosen."] };

	const selectedSchool = await prisma.school.findUnique({
		where: { id: schoolId },
		select: {
			id: true,
			slug: true,
			name: true,
			director: {
				where: {
					sessionId: selectedSession.id,
				},
				select: {
					user: {
						select: {
							officialName: true,
							email: true,
						},
					},
				},
			},
		},
	});
	if (!selectedSchool) return { ok: false, message: ["School not found."] };

	const grantedDelegationAlredyExists = await prisma.applicationGrantedDelegationCountries.findFirst({
		where: {
			schoolId: schoolId,
			sessionId: selectedSession.id,
		},
	});

	if (grantedDelegationAlredyExists) return { ok: false, message: ["The school alredy has delegations assigned."] };

	const schoolIdsOfGrantedDelegations = [...selectedSession.ApplicationGrantedDelegationCountries.map((d) => d.schoolId), schoolId];
	const parsedSate = JSON.parse(selectedSession.savedDelegationDeclarationState);
	const filteredStateArray = parsedSate.filter((s: { schoolId: string }) => !schoolIdsOfGrantedDelegations.includes(s.schoolId));

	let newDelegations = [];
	selectedSession.ApplicationGrantedDelegationCountries.forEach((d) => {
		let index = 1;
		d.countries.forEach((c) => {
			newDelegations.push({ schoolId: d.schoolId, delegationNumber: index, country: c });
			index++;
		});
	});

	const finalStateArray = [...filteredStateArray, ...newDelegations];

	try {
		await prisma.$transaction(async (tx) => {
			await tx.applicationGrantedDelegationCountries.create({
				data: {
					schoolId: schoolId,
					sessionId: selectedSession.id,
					countries: validStringCountries,
				},
			});
			await tx.session.update({
				where: { id: selectedSession.id },
				data: {
					savedDelegationDeclarationState: JSON.stringify(finalStateArray),
				},
			});
			selectedSchool.director.forEach(async (d) => {
				await sendEmailSchoolHasBeenAssignedCountries({
					officialName: d.user.officialName,
					email: d.user.email,
					delegationLink: `https://www.medimun.org/medibook/sessions/${selectedSession.number}/schools/${selectedSchool.slug || selectedSchool.id}/delegation`,
				});
			});
		});
	} catch (e) {
		return { ok: false, message: ["Error saving delegation declaration."] };
	}

	return { ok: true, message: ["Delegation declaration accepted."] };
}

export async function saveDelegationDeclarationState(state: Array<{ schoolId: string; countries: string[] }>, sessionId: string) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const isDirector = authorize(authSession, [s.sd, s.director, s.admins, s.sg, s.pga]);
	if (!isDirector) return { ok: false, message: "Unauthorized" };

	if (state.length == 0) return { ok: true, message: ["State not saved."] };

	const selectedSession = await prisma.session.findFirst({
		where: { id: sessionId },
		include: { ApplicationGrantedDelegationCountries: true },
	});

	if (!selectedSession) return { ok: false, message: "No current session found." };

	const schoolIdsOfGrantedDelegations = selectedSession.ApplicationGrantedDelegationCountries.map((d) => d.schoolId);
	const filteredStateArray = state.filter((s) => !schoolIdsOfGrantedDelegations.includes(s.schoolId));

	let newDelegations = [];
	selectedSession.ApplicationGrantedDelegationCountries.forEach((d) => {
		let index = 1;
		d.countries.forEach((c) => {
			newDelegations.push({ schoolId: d.schoolId, delegationNumber: index, country: c });
			index++;
		});
	});

	const finalStateArray = [...filteredStateArray, ...newDelegations];

	if (!selectedSession) return { ok: false, message: "No current session found." };
	const jsonState = JSON.stringify(finalStateArray);

	try {
		await prisma.session.update({
			where: { id: selectedSession.id },
			data: {
				savedDelegationDeclarationState: jsonState,
			},
		});
	} catch (e) {
		return { ok: false, message: ["Error saving state."] };
	}
	return { ok: true, message: ["State saved."] };
}
