"use server";

import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { z } from "zod";
import { parseFormData } from "@/lib/form";
import { entityCase } from "@/lib/text";

export async function addSession() {
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.sd, s.admins])) {
		return { ok: false, message: "Unauthorized" };
	}

	const latestSession = await prisma.session.findFirst({
		orderBy: { numberInteger: "desc" },
	});

	const isLatestSessionCurrent = latestSession?.isCurrent;

	if (!isLatestSessionCurrent) {
		return { ok: false, message: "The latest session is not current" };
	}

	try {
		const session = await prisma.session.create({
			data: {
				number: (latestSession.numberInteger + 1).toString(),
				numberInteger: latestSession.numberInteger + 1,
				isCurrent: false,
				isVisible: false,
				isPartlyVisible: false,
			},
		});
	} catch (error) {
		return { ok: false, message: "Failed to create session" };
	}
	return { ok: true, message: "Session created" };
}
