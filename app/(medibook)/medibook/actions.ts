"use server";

import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { areSchoolDirectorApplicationsOpen } from "./(sessionSpecific)/sessions/[sessionNumber]/applications/school-director/page";
import { authorize, s } from "@/lib/authorize";

export async function getMoreSessions(skip = 5) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const sessions = await prisma.session
		.findMany({
			skip: skip,
			take: 10,
			orderBy: [{ isMainShown: "desc" }, { numberInteger: "desc" }],
		})
		.catch();
	return sessions;
}

export async function getSessionData(number) {
	const authSession = await auth();
	if (!authSession) return;
	const isManagement = authorize(authSession, [s.management]);
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
					...(isManagement ? {} : { where: { isVisible: true } }),
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
					...(isManagement ? {} : { where: { isVisible: true } }),
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
	const sessionObject = {
		...selectedSession,
		applicationsOpen: areSchoolDirectorApplicationsOpen(selectedSession),
	};
	return sessionObject;
}
