"use server";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { parseFormData } from "@/lib/parse-form-data";
import prisma from "@/prisma/client";
import { z } from "zod";

export async function editIndividualCertificate({ certificateId, formData }) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Not authenticated" };

	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: "Not authorized" };

	const schema = z.object({
		secretaryGeneral: z.string().min(12).max(12),
		seniorDirector: z.string().min(12).max(12),
		nameOverride: z.string().max(50).optional().nullable(),
		specialMessage: z.string().max(100).optional().nullable(),
		isVoid: z.boolean(),
		voidMessage: z.string().max(1000).optional().nullable(),
	});

	const parsedFormData = parseFormData(formData);
	const { data, error } = schema.safeParse(parsedFormData);
	if (error) return { ok: false, message: ["Invalid form data"] };

	const certificate = await prisma.participationCertificate.findUnique({
		where: { id: certificateId },
		include: {
			session: {
				select: {
					secretaryGeneral: {
						select: {
							user: {
								select: {
									officialName: true,
									officialSurname: true,
									displayName: true,
									id: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!certificate) return { ok: false, message: ["Certificate not found"] };

	const seniorDirectors = await prisma.seniorDirector.findMany({
		select: {
			user: {
				select: {
					officialName: true,
					officialSurname: true,
					displayName: true,
					id: true,
				},
			},
		},
		orderBy: {
			user: {
				officialName: "asc",
			},
		},
	});

	//validate and edit
	if (data.secretaryGeneral !== certificate.session.secretaryGeneral[0].user.id) return { ok: false, message: ["Secretary General does not match"] };
	if (!seniorDirectors.find((seniorDirector) => seniorDirector.user.id === data.seniorDirector)) return { ok: false, message: ["Senior Director not found"] };

	await prisma.participationCertificate.update({
		where: { id: certificateId },
		data: {
			nameOverride: data.nameOverride,
			specialMessage: data.specialMessage,
			teacherSignatureId: data.seniorDirector,
			studentSignatureId: data.secretaryGeneral,
			isVoid: data.isVoid,
			voidMessage: data.voidMessage,
		},
	});

	return { ok: true, message: ["Certificate updated"] };
}

export async function deleteIndividualCertificate({ certificateId }) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Not authenticated" };

	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: "Not authorized" };

	await prisma.participationCertificate.delete({ where: { id: certificateId } });

	return { ok: true, message: ["Certificate deleted"] };
}
