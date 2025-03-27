"use server";

import { auth } from "@/auth";
import { sendEmailReceivedNewCertificateOfParticipation } from "@/email/send";
import { authorize, s } from "@/lib/authorize";
import { parseFormData } from "@/lib/parse-form-data";
import prisma from "@/prisma/client";
import { Session } from "@prisma/client";
import { z } from "zod";

export async function createCertificates({ formData, selectedUsers, selectedSession }: { formData: FormData; selectedUsers: { id: string; officialName: string }[]; selectedSession: Session }) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Not authenticated" };

	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: "Not authorized" };

	const schema = z.object({
		secretaryGeneral: z.string().min(12).max(12),
		seniorDirector: z.string().min(12).max(12),
		nameOverride: z.string().max(50).optional().nullable(),
		specialMessage: z.string().max(100).optional().nullable(),
		notifyUsers: z.boolean().optional().nullable(),
	});

	const parsedFormData = parseFormData(formData);
	const { data, error } = schema.safeParse(parsedFormData);
	if (error) return { ok: false, message: ["Invalid form data"] };

	const prismaSelectedSession = await prisma.session.findUnique({
		where: { id: selectedSession.id },
		include: { secretaryGeneral: { select: { user: { select: { officialName: true, officialSurname: true, displayName: true, id: true } } } } },
	});

	if (!prismaSelectedSession) return { ok: false, message: ["Session not found"] };
	if (data.secretaryGeneral !== prismaSelectedSession.secretaryGeneral[0].user.id) return { ok: false, message: ["Secretary General does not match"] };

	const selectedPrismaUsers = await prisma.user.findMany({
		where: {
			id: { in: selectedUsers.map((user) => user.id) },
			CertificateAwardedTo: { none: { session: { number: selectedSession.number } } },
		},
	});

	const selectedSeniorDirector = await prisma.user.findUnique({
		where: { id: data.seniorDirector, seniorDirector: { some: {} } },
	});

	if (!selectedSeniorDirector) return { ok: false, message: ["Senior Director not found"] };

	if (selectedPrismaUsers.length === 0) return { ok: false, message: ["No users selected"] };
	if (selectedPrismaUsers.length !== selectedUsers.length) return { ok: false, message: ["Some users have already received certificates"] };

	try {
		await prisma.participationCertificate.createMany({
			data: selectedPrismaUsers.map((user) => ({
				nameOverride: data.nameOverride,
				specialMessage: data.specialMessage,
				sessionId: selectedSession.id,
				userId: user.id,
				teacherSignatureId: selectedSeniorDirector.id,
				studentSignatureId: data.secretaryGeneral,
			})),
		});
	} catch (e) {
		return { ok: false, message: ["Error creating certificates"] };
	}

	if (selectedSession.publishCertificates && data.notifyUsers) {
		const emailPromises = selectedPrismaUsers.map((user) => {
			return sendEmailReceivedNewCertificateOfParticipation({
				email: user.email,
				officialName: user.officialName,
			});
		});
		await Promise.all(emailPromises);
	}

	return { ok: true, message: ["Certificates created"] };
}
