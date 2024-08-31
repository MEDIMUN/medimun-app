"use server";

import { auth } from "@/auth";
import prisma from "@/prisma/client";

export async function getMoreSessions(skip = 5) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const sessions = await prisma.session
		.findMany({
			skip: skip,
			take: 10,
			orderBy: [{ isCurrent: "desc" }, { numberInteger: "desc" }],
		})
		.catch();
	return sessions;
}

export async function getSessionData(number) {
	const session = await auth();
	if (!session) return;
	let selectedSession = null;
	try {
		selectedSession = await prisma.session.findFirst({
			where: {
				number: number,
			},
			orderBy: {
				numberInteger: "desc",
			},
			include: {
				committee: {
					select: {
						id: true,
						name: true,
						slug: true,
						shortName: true,
						type: true,
					},
					orderBy: {
						name: "asc",
					},
				},
				department: {
					select: {
						id: true,
						name: true,
						slug: true,
						shortName: true,
					},
					orderBy: {
						name: "asc",
					},
				},
			},
		});
	} catch (e) {
		return;
	}
	return selectedSession;
}
