"use server";

import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { arePositionPaperSubmissionsOpen } from "../page";
import { z } from "zod";
import { PositionPaperStatus } from "@prisma/client";
import { parseFormData } from "@/lib/parse-form-data";
import { sendEmailReturnPositionPaper } from "@/email/send";

export async function createPositionPaper(resourceId: string, committeeId: string) {
	const authSession = await auth();

	if (!authSession) return { ok: false, message: ["Unauthorized"] };
	console.log(resourceId, committeeId);

	const selectedCommittee = await prisma.committee.findFirst({ where: { id: committeeId } });

	if (!selectedCommittee) return { ok: false, message: ["Committee not found."] };

	const isDelegateOfCommittee = authorizeDelegateCommittee(authSession?.user.currentRoles, selectedCommittee?.id) || true; //FIXME:

	if (!isDelegateOfCommittee) return { ok: false, message: ["Unauthorized"] };

	const otherPositionPapersOfDelegate = await prisma.positionPaper.findMany({
		where: { userId: authSession.user.id, committeeId: selectedCommittee.id },
		orderBy: { index: "desc" },
		take: 1,
	});

	if (!arePositionPaperSubmissionsOpen(selectedCommittee)) return { ok: false, message: ["Position paper submissions are closed."] };

	let lastPositionPaper = null as any;

	if (otherPositionPapersOfDelegate.length > 0) lastPositionPaper = otherPositionPapersOfDelegate[0];

	if (lastPositionPaper && !["REVISION"].includes(lastPositionPaper?.status))
		return { ok: false, message: ["You have already submitted a position paper."] };

	try {
		await prisma.positionPaper.create({
			data: {
				committeeId: selectedCommittee.id,
				userId: authSession.user.id,
				resourceId,
			},
		});
	} catch (error) {
		return { ok: false, message: ["Error submitting position paper."] };
	}

	return { ok: true, message: ["Position paper submitted"] };
}

export async function deletePositionPaper(paperId: string) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedPositionPaper = await prisma.positionPaper.findFirst({
		where: {
			id: paperId,
		},
		include: {
			committee: true,
		},
	});

	if (!selectedPositionPaper) return { ok: false, message: ["Position paper not found."] };

	const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedPositionPaper?.committeeId);

	if (!isChairOfCommittee && !isManagement) return { ok: false, message: ["Unauthorized"] };

	try {
		await prisma.positionPaper.delete({ where: { id: paperId } });
	} catch (error) {
		console.log(paperId);
		return { ok: false, message: ["Error deleting position paper."] };
	}

	return { ok: true, message: ["Position paper deleted."] };
}

export async function returnPositionPaper(formData: FormData, paperId: string) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: ["Unauthorized"] };
	const isManagement = authorize(authSession, [s.management]);

	if (!formData) return { ok: false, message: ["Invalid data."] };

	const schema = z.object({
		comment: z.string().max(500).trim().optional().nullable(),
		action: z.enum(["APPROVED", "REJECTED", "REVISION"]),
	});

	const parsedFormData = parseFormData(formData);

	const { data, error } = schema.safeParse(parsedFormData);

	if (error) return { ok: false, message: ["Invalid data."] };

	const selectedPositionPaper = await prisma.positionPaper.findFirst({
		where: {
			id: paperId,
		},
		include: {
			committee: true,
			user: true,
		},
	});

	if (!selectedPositionPaper) return { ok: false, message: ["Position paper not found."] };

	const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedPositionPaper.committeeId);

	if (!isChairOfCommittee && !isManagement) return { ok: false, message: ["Unauthorized"] };

	if (selectedPositionPaper.status !== PositionPaperStatus.PENDING) return { ok: false, message: ["Position paper is already returned."] };

	const comment = data.comment || null;

	try {
		await prisma.positionPaper.update({
			where: { id: paperId },
			data: {
				returnTime: new Date(),
				status: data.action,
				chairComment: comment,
			},
		});
	} catch (error) {
		return { ok: false, message: ["Error returning position paper."] };
	}

	const detailsMap = {
		APPROVED: "We are pleased to inform you that your position paper has been approved.",
		REJECTED: "We regret to inform you that your position paper has been rejected.",
		REVISION: "We would like to to inform you that your position paper requires revision.",
	};

	try {
		await sendEmailReturnPositionPaper({
			email: selectedPositionPaper.user.email,
			officialName: selectedPositionPaper.user.officialName,
			details: detailsMap[data.action],
		});
	} catch {}

	return { ok: true, message: ["Position paper returned."] };
}
