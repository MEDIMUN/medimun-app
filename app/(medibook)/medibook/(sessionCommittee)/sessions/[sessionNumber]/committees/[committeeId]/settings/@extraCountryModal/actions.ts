"use server";

import { auth } from "@/auth";
import { countries } from "@/data/countries";
import { authorize, s } from "@/lib/authorize";
import { parseFormData } from "@/lib/parse-form-data";
import { entityCase } from "@/lib/text";
import prisma from "@/prisma/client";
import { z } from "zod";

export async function addExtraCountry(formData, params) {
	const authSession = await auth();

	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const schema = z.object({
		countryNameEn: z.string().trim().min(3).max(100).transform(entityCase),
		countryCode: z
			.string()
			.trim()
			.min(2)
			.max(4)
			.toUpperCase()
			.regex(/^[A-Z]+$/)
			.optional()
			.nullable(),
		isPowerToVeto: z.boolean(),
	});
	const parsedFormData = parseFormData(formData);
	const { data, error } = schema.safeParse(parsedFormData);

	if (error) return { ok: false, message: "Invalid data." };

	const allExistingCountryCodes = countries.map((country) => country.countryCode);

	if (data.countryCode && allExistingCountryCodes.includes(data.countryCode)) return { ok: false, message: "Country code already exists." };

	const selectedSession = await prisma.session.findUnique({ where: { number: params.sessionNumber } });

	const currentSession = await prisma.session.findFirst({ where: { isCurrent: true } });

	let selectedCommittee;
	try {
		selectedCommittee = await prisma.committee.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.committeeId, session: { number: params.sessionNumber } },
					{ slug: params.committeeId, session: { number: params.sessionNumber } },
				],
			},
			include: { ExtraCountry: true },
		});
	} catch (error) {
		return { ok: false, message: "Committee not found." };
	}

	if (!selectedCommittee) return { ok: false, message: "Committee not found." };

	if (!selectedSession) return { ok: false, message: "Invalid session" };

	if (selectedCommittee.ExtraCountry.length >= 20) return { ok: false, message: "Maximum number of extra countries/entities reached in committee." };

	if (!authorize(authSession, [s.management]) && !selectedSession.isCurrent && selectedSession.numberInteger <= currentSession.numberInteger)
		if (!authorize(authSession, [s.admins, s.sd])) {
			return { ok: false, message: "Session is not current or in the future." };
		}

	try {
		await prisma.extraCountry.create({
			data: {
				countryNameEn: data.countryNameEn,
				countryCode: data.countryCode,
				isPowerToVeto: data.isPowerToVeto,
				committeeId: selectedCommittee.id,
			},
			select: { id: true },
		});
	} catch (error) {
		return { ok: false, message: "Failed to create department." };
	}

	return { ok: true, message: "Extra country created." };
}

export async function editExtraCountry(formData, params, extraCountryId) {
	const authSession = await auth();

	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const schema = z.object({
		countryNameEn: z.string().trim().min(3).max(100).transform(entityCase),
		isPowerToVeto: z.boolean(),
	});
	const parsedFormData = parseFormData(formData);
	const { data, error } = schema.safeParse(parsedFormData);

	if (error) return { ok: false, message: "Invalid data." };

	const selectedSession = await prisma.session.findUnique({ where: { number: params.sessionNumber } });

	const currentSession = await prisma.session.findFirst({ where: { isCurrent: true } });

	let selectedCommittee;
	try {
		selectedCommittee = await prisma.committee.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.committeeId, session: { number: params.sessionNumber } },
					{ slug: params.committeeId, session: { number: params.sessionNumber } },
				],
			},
			include: { ExtraCountry: true },
		});
	} catch (error) {
		return { ok: false, message: "Committee not found." };
	}

	if (!selectedCommittee) return { ok: false, message: "Committee not found." };

	if (!selectedSession) return { ok: false, message: "Invalid session" };

	if (!authorize(authSession, [s.management]) && !selectedSession.isCurrent && selectedSession.numberInteger <= currentSession.numberInteger)
		if (!authorize(authSession, [s.admins, s.sd])) {
			return { ok: false, message: "Session is not current or in the future." };
		}

	const selectedExtraCountry = await prisma.extraCountry.findFirst({
		where: {
			committeeId: selectedCommittee.id,
			id: extraCountryId,
		},
	});

	if (!selectedExtraCountry) return { ok: false, message: "Extra country/entity not found." };

	try {
		await prisma.extraCountry.update({
			where: {
				id: extraCountryId,
			},
			data: data,
		});
	} catch (error) {
		return { ok: false, message: "Failed to update extra country/entity." };
	}

	return { ok: true, message: "Extra country/entity updated." };
}

export async function deleteExtraCountry(params, extraCountryId) {
	const selectedCommittee = await prisma.committee.findFirst({
		where: {
			OR: [
				{ id: params.committeeId, session: { number: params.sessionNumber } },
				{ slug: params.committeeId, session: { number: params.sessionNumber } },
			],
		},
	});

	if (!selectedCommittee) return { ok: false, message: "Committee not found." };

	const selectedExtraCountry = await prisma.extraCountry.findFirst({
		where: {
			committeeId: selectedCommittee.id,
			id: extraCountryId,
		},
	});

	if (!selectedExtraCountry) return { ok: false, message: "Extra country/entity not found." };

	try {
		await prisma.$transaction([
			prisma.delegate.updateMany({
				where: {
					committeeId: selectedCommittee.id,
					country: selectedExtraCountry.countryCode,
				},
				data: {
					country: null,
				},
			}),
			prisma.extraCountry.delete({
				where: {
					id: extraCountryId,
				},
			}),
		]);
	} catch (error) {
		return { ok: false, message: "Failed to delete extra country/entity." };
	}

	return {
		ok: true,
		message: [
			"Extra country/entity deleted.",
			{ description: "All delegates in the committee with the removed entity assigned had their countries removed." },
		],
	};
}
