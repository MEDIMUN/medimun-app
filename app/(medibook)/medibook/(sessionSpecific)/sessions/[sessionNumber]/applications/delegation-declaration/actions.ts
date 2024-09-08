"use server";

import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";

export async function changeDelegateApplicationStatus(formData, selectedSessionNumber) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const isSeniorDirector = authorize(authSession, [s.sd, s.admins]);
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
	const isSeniorDirector = authorize(authSession, [s.sd, s.admins]);
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
	const isSeniorDirector = authorize(authSession, [s.sd, s.admins]);
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
