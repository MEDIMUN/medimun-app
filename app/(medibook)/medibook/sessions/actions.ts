"use server";

import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";
import { redirect } from "next/navigation";

export async function createSession(formData) {
	const session = await getServerSession(authOptions);
	if (!authorize(session, [s.admin, s.sd])) redirect("/medibook/sessions");

	const sessionNumber = formData.get("sessionNumber");
	const theme = formData.get("theme");
	const phrase2 = formData.get("phrase2");

	let latestSession, currentSession;
	try {
		latestSession =
			(
				await prisma.session.findFirst({
					orderBy: {
						numberInteger: "desc",
					},
				})
			)?.numberInteger || 0;
	} catch (e) {
		return { ok: false, error: "Could not create session", title: "Could not create session", description: "An unknown error occured", variant: "destructive" };
	}
	try {
		currentSession =
			(
				await prisma.session.findFirst({
					where: {
						isCurrent: true,
					},
				})
			)?.numberInteger || 0;
	} catch (e) {
		return { ok: false, error: "Could not create session", title: "Could not create session", description: "An unknown error occured", variant: "destructive" };
	}
	if (latestSession == 0 && parseInt(sessionNumber) !== 1) return { ok: false, error: "First session must be number 1", title: "First session must be number 1", variant: "destructive" };
	if (latestSession >= parseInt(sessionNumber)) return { ok: false, error: "Session number must be greater than the latest session", title: "Session number must be greater than the latest session", variant: "destructive" };
	if (latestSession > currentSession) return { ok: false, error: "Cannot create a session when the latest session is not the current session", title: "Cannot create a session when the latest session is not the current session", variant: "destructive" };
	if (parseInt(sessionNumber) - currentSession > 1) return { ok: false, error: "Cannot create a session when the current session is not the previous session", title: "Cannot create a session when the current session is not the previous session", variant: "destructive" };
	if (parseInt(sessionNumber) - currentSession < 0) return { ok: false, error: "Cannot create a session when the current session is not the previous session", title: "Cannot create a session when the current session is not the previous session", variant: "destructive" };
	if (typeof theme !== "string" || typeof phrase2 !== "string") return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
	if (theme && theme.length < 3) return { ok: false, error: "Theme must be at least 3 characters", title: "Theme must be at least 3 characters", variant: "destructive" };
	if (phrase2 && phrase2.length < 3) return { ok: false, error: "Phrase 2 must be at least 3 characters", title: "Phrase 2 must be at least 3 characters", variant: "destructive" };
	if (theme && theme.length > 22) return { ok: false, error: "Theme must be at most 22 characters", title: "Theme must be at most 22 characters", variant: "destructive" };
	if (phrase2 && phrase2.length > 40) return { ok: false, error: "Phrase 2 must be at most 40 characters", title: "Phrase 2 must be at most 40 characters", variant: "destructive" };

	try {
		await prisma.session.create({
			data: {
				number: sessionNumber,
				numberInteger: parseInt(sessionNumber),
				theme: theme,
				phrase2: phrase2,
			},
		});
	} catch (e) {
		return { ok: false, error: "Could not create session", title: "Could not create session", description: "An unknown error occured", variant: "destructive" };
	}
	return { ok: true, message: "Session created", title: "Session created", description: "A new session has been created ", variant: "default" };
}
