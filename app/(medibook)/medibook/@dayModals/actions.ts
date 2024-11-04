"use server";

import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { parseFormData } from "@/lib/parse-form-data";
import prisma from "@/prisma/client";
import { DayType } from "@prisma/client";
import { z } from "zod";

export async function createDay(formData: FormData) {
	const authSession = await auth();
	const isAuthorized = authSession && authorize(authSession, [s.admins, s.sd, s.director]);
	if (!isAuthorized) return { ok: false, message: ["Unauthorized."] };

	const schema = z.object({
		name: z.string().optional().nullable(),
		description: z.string().optional().nullable(),
		date: z.string().transform((value) => new Date(value)),
		locationId: z.string().optional().nullable(),
		sessionId: z.string(),
		type: z.enum(["CONFERENCE", "WORKSHOP", "EVENT"]),
	});

	const parsedFormData = parseFormData(formData);
	const { error, data } = schema.safeParse(parsedFormData);

	if (error) {
		return { ok: false, message: ["Invalid data."] };
	}

	const { locationId, ...rest } = data;

	try {
		await prisma.day.create({
			data: {
				...rest,
				...(locationId ? { locationId: locationId } : { locationId: null }),
			},
		});
	} catch (e) {
		return { ok: false, message: ["Failed to create day."] };
	}

	return { ok: true, message: ["Day added."] };
}

export async function editDay(formData: FormData) {
	const authSession = await auth();
	const isAuthorized = authSession && authorize(authSession, [s.admins, s.sd, s.director]);
	if (!isAuthorized) return { ok: false, message: ["Unauthorized."] };

	const schema = z.object({
		id: z.string(),
		name: z.string().optional().nullable(),
		description: z.string().optional().nullable(),
		date: z.string().transform((value) => new Date(value)),
		locationId: z.string().optional().nullable(),
		type: z.enum(["CONFERENCE", "WORKSHOP", "EVENT"]),
	});

	const parsedFormData = parseFormData(formData);
	const { error, data } = schema.safeParse(parsedFormData);

	if (error) return { ok: false, message: ["Invalid data."] };

	const { id, locationId, ...rest } = data;

	try {
		await prisma.day.update({
			where: { id },
			data: {
				...rest,
				...(locationId ? { locationId: locationId } : { locationId: null }),
			},
		});
	} catch (e) {
		return { ok: false, message: ["Failed to update day."] };
	}

	return { ok: true, message: ["Day updated."] };
}

export async function deleteDay(id: string) {
	const authSession = await auth();
	const isAuthorized = authSession && authorize(authSession, [s.admins, s.sd, s.director]);
	if (!isAuthorized) return { ok: false, message: ["Unauthorized."] };

	try {
		await prisma.day.delete({ where: { id } });
	} catch (e) {
		return { ok: false, message: ["Failed to delete day."] };
	}
	return { ok: true, message: ["Day deleted."] };
}
