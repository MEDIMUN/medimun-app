"use server";

import { auth } from "@/auth";
import { sendEmailReceivedSchoolDirectorApplication } from "@/email/send";
import prisma from "@/prisma/client";

export async function applyAsSchoolDirector(formData: FormData, selectedSessionId: string) {
	const authSession = await auth();

	const selectedSession = await prisma.session.findFirst({
		where: {
			id: selectedSessionId,
		},
	});

	const selectedSchool = await prisma.school.findFirst({
		where: {
			id: formData.get("schoolId") as string,
		},
	});

	const userHasApplicationInSession = await prisma.applicationSchoolDirector.findFirst({
		where: {
			userId: authSession.user.id,
			sessionId: selectedSession.id,
		},
	});

	const selectedUser = await prisma.user.findFirst({
		where: {
			id: authSession.user.id,
		},
	});

	if (userHasApplicationInSession) return { ok: false, message: "You have already applied as school director for this session." };

	const userIsSchoolDirectorInSession = await prisma.schoolDirector.findFirst({
		where: {
			userId: authSession.user.id,
			sessionId: selectedSession.id,
		},
	});

	if (userIsSchoolDirectorInSession) return { ok: false, message: "You are already a school director for this session." };

	if (!authSession || !selectedSession || !selectedSchool) return { ok: false, message: "Invalid data." };

	let res;

	try {
		res = await prisma.applicationSchoolDirector.create({
			data: {
				user: {
					connect: {
						id: authSession.user.id,
					},
				},
				session: {
					connect: {
						id: selectedSession.id,
					},
				},
				school: {
					connect: {
						id: selectedSchool.id,
					},
				},
			},
		});
	} catch (error) {
		return { ok: false, message: "Error applying as school director. Please contact us if you think this was a mistake." };
	}

	try {
		await sendEmailReceivedSchoolDirectorApplication({
			email: selectedUser.email,
			officialName: selectedUser.officialName,
			officialSurname: selectedUser.officialSurname,
			schoolName: selectedSchool.name,
			applicationId: res.id,
		});
	} catch (error) {
		return { ok: true, message: "Applied as school director." };
	}

	return { ok: true, message: "Applied as school director." };
}
