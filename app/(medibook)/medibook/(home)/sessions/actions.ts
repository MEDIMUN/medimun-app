"use server";

import prisma from "@/prisma/client";
import { s, authorize } from "@/lib/authorize";
import { auth } from "@/auth";
import { z } from "zod";
import { parseFormData } from "@/lib/form";

const sessionSchema = z.object({
	sessionNumber: z.string().refine((val) => !isNaN(parseInt(val)), {
		message: "Session number must be a number",
	}),
	theme: z
		.string()
		.transform((val) => (val.trim() === "" ? null : val)) // Transform empty string to null
		.nullable()
		.optional()
		.refine((val) => val === null || val.length >= 3, { message: "Theme must be at least 3 characters" })
		.refine((val) => val === null || val.length <= 22, { message: "Theme must be at most 22 characters" }),
	phrase2: z
		.string()
		.transform((val) => (val.trim() === "" ? null : val)) // Transform empty string to null
		.nullable()
		.optional()
		.refine((val) => val === null || val.length >= 3, { message: "Phrase 2 must be at least 3 characters" })
		.refine((val) => val === null || val.length <= 40, { message: "Phrase 2 must be at most 40 characters" }),
});

export async function createSession(formData: FormData) {
	const session = await auth();
	if (!session || !authorize(session, [s.admin, s.sd])) return { ok: false, message: "Unauthorized" };

	const formDataObject = parseFormData(formData);

	const validation = sessionSchema.safeParse(formDataObject);

	if (!validation.success) return { ok: false, message: validation.error.errors.map((error) => error.message).join(", ") };

	const { sessionNumber, theme, phrase2 } = validation.data;

	let latestSession, currentSession;
	try {
		latestSession = (await prisma.session.findFirst({ orderBy: { numberInteger: "desc" } }))?.numberInteger || 0;
	} catch (e) {
		return { ok: false, message: "Could not create session" };
	}

	try {
		currentSession = (await prisma.session.findFirst({ where: { isCurrent: true } }))?.numberInteger || 0;
	} catch {
		return { ok: false, message: "Could not create session" };
	}

	const sessionNumberInteger = parseInt(sessionNumber);

	if (latestSession == 0 && sessionNumberInteger !== 1)
		return { ok: false, error: "First session must be number 1", title: "First session must be number 1", variant: "destructive" };

	if (latestSession >= sessionNumberInteger) return { ok: false, message: "Session number must be greater than the latest session" };

	if (latestSession > currentSession && !authorize(session, [s.admins]))
		return { ok: false, message: "Cannot create a session when the latest session is not the current session" };

	if (!authorize(session, [s.admins]) && (sessionNumberInteger - currentSession > 1 || sessionNumberInteger - currentSession < 0))
		return { ok: false, message: "Cannot create a session when the current session is not the previous session" };

	try {
		await prisma.session.create({
			data: {
				number: sessionNumber,
				numberInteger: sessionNumberInteger,
				theme: theme,
				phrase2: phrase2,
			},
		});
	} catch (e) {
		console.error(e);
		return { ok: false, message: "Could not create session" };
	}
	return { ok: true, message: "Session created" };
}
