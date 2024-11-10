"use server";

import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { areSchoolDirectorApplicationsOpen } from "./(sessionSpecific)/sessions/[sessionNumber]/applications/school-director/page";
import { authorize, s } from "@/lib/authorize";
import { generateUserData, generateUserDataObject } from "@/lib/user";

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

export async function fetchUserForTooltip(userId) {
	const authSession = await auth();
	if (!authSession) return;
	let user = null as any;
	try {
		user = await prisma.user.findFirst({
			where: {
				id: userId,
			},
			select: {
				officialName: true,
				officialSurname: true,
				displayName: true,
				id: true,
				nationality: true,
				username: true,
				bio: true,
				isProfilePrivate: true,
				...generateUserDataObject(),
			},
		});
	} catch (e) {
		return { ok: false, message: ["User not found"] };
	}

	const userWithData = { ...generateUserData(user), bio: user.bio, username: user.username, isProfilePrivate: user.isProfilePrivate };

	return { ok: true, message: [], data: { user: userWithData } };
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
