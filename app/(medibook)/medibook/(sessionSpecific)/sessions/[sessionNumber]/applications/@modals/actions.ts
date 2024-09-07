"use server";

import { sendEmailAcceptSchoolDirectorApplication, sendEmailRejectSchoolDirectorApplication } from "@/email/send";
import prisma from "@/prisma/client";

export async function approveSchoolDirectorApplication(applicationId: string) {
	let selectedApplication;

	try {
		selectedApplication = await prisma.applicationSchoolDirector.findUnique({
			where: {
				id: applicationId,
			},
			include: {
				school: true,
				session: true,
				user: {
					include: {
						schoolDirector: {
							include: {
								school: true,
								session: true,
							},
						},
					},
				},
			},
		});
	} catch (error) {
		return { ok: false, message: "Application not found" };
	}

	if (!selectedApplication) return { ok: false, message: "Application not found" };
	if (selectedApplication.isApproved) return { ok: false, message: "Application already approved" };
	if (!selectedApplication.session.isCurrent) return { ok: false, message: "Session is not current" };

	if (selectedApplication.user.schoolDirector.find((role) => role.session.isCurrent))
		return { ok: false, message: "User is already a school director in the current session. Please delete the application." };

	try {
		await prisma.$transaction([
			prisma.applicationSchoolDirector.update({
				where: { id: applicationId },
				data: { isApproved: true },
			}),
			prisma.schoolDirector.create({
				data: {
					user: { connect: { id: selectedApplication.userId } },
					school: { connect: { id: selectedApplication.schoolId } },
					session: { connect: { id: selectedApplication.sessionId } },
				},
			}),
		]);
	} catch (error) {
		return { ok: false, message: "Something went wrong." };
	}
	try {
		await sendEmailAcceptSchoolDirectorApplication({
			email: selectedApplication.user.email,
			officialName: selectedApplication.user.officialName,
			officialSurname: selectedApplication.user.officialSurname,
			applicationId: selectedApplication.id,
		});
	} catch (error) {
		return { ok: false, message: "Application approved but the email notification could not be sent." };
	}
	return { ok: true, message: "Application approved and email notification sent." };
}

export async function deleteSchoolDirectorApplication(applicationId: string) {
	let selectedApplication;

	try {
		selectedApplication = await prisma.applicationSchoolDirector.findUnique({
			where: {
				id: applicationId,
			},
			include: {
				school: true,
				session: true,
				user: {
					include: {
						schoolDirector: {
							include: {
								school: true,
								session: true,
							},
						},
					},
				},
			},
		});
	} catch (error) {
		return { ok: false, message: "Application not found." };
	}

	if (!selectedApplication) return { ok: false, message: "Application not found" };
	if (selectedApplication.isApproved) return { ok: false, message: "Application already approved" };
	if (!selectedApplication.session.isCurrent) return { ok: false, message: "Session is not current" };

	try {
		await prisma.applicationSchoolDirector.delete({
			where: { id: applicationId },
		});
	} catch (error) {
		return { ok: false, message: "Something went wrong." };
	}
	try {
		await sendEmailRejectSchoolDirectorApplication({
			email: selectedApplication.user.email,
			officialName: selectedApplication.user.officialName,
			officialSurname: selectedApplication.user.officialSurname,
			applicationId: selectedApplication.id,
		});
	} catch (error) {
		return { ok: false, message: "Application deleted but the email notification could not be sent." };
	}
	return { ok: true, message: "Application deleted and email notification sent." };
}
