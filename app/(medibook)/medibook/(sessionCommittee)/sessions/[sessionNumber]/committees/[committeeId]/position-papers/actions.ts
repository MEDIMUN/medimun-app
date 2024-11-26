"use server";

import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";
import prisma from "@/prisma/client";

export async function changePositionPaperSubmissiontatus(formData, selectedCommitteeId) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const selectedCommittee = await prisma.committee.findUnique({ where: { id: selectedCommitteeId, session: { isCurrent: true } } });
	if (!selectedCommittee) return { ok: false, message: "Session not found" };
	const isManagement = authorize(authSession, [s.management]);
	const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee?.id);
	if (!isManagement && !isChairOfCommittee) return { ok: false, message: "Unauthorized" };

	const autoOpenTime = formData.get("PositionPaperSubmissionAutoOpenTime");
	const autoCloseTime = formData.get("PositionPaperSubmissionAutoCloseTime");

	await prisma.committee.update({
		where: { id: selectedCommittee.id },
		data: {
			...(autoOpenTime && { positionPaperSubmissionAutoOpenTime: new Date(autoOpenTime) }),
			...(autoCloseTime && { positionPaperSubmissionAutoCloseTime: new Date(autoCloseTime) }),
		},
	});

	return { ok: true, message: "Settings updated." };
}

export async function isPositionPaperSubmissionForceOpenChangeAction(data, selectedCommitteeId) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const selectedCommittee = await prisma.committee.findUnique({ where: { id: selectedCommitteeId, session: { isCurrent: true } } });
	if (!selectedCommittee) return { ok: false, message: "Session not found" };
	const isManagement = authorize(authSession, [s.management]);
	const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee?.id);
	if (!isManagement && !isChairOfCommittee) return { ok: false, message: "Unauthorized" };

	await prisma.committee.update({
		where: { id: selectedCommittee.id },
		data: { isPositionPaperSubmissionForceOpen: data },
	});

	return { ok: true, message: "Settings updated." };
}

export async function isPositionPaperSubmissionAutoOpenChangeAction(data, selectedCommitteeId) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const selectedCommittee = await prisma.committee.findUnique({ where: { id: selectedCommitteeId, session: { isCurrent: true } } });
	if (!selectedCommittee) return { ok: false, message: "Session not found" };
	const isManagement = authorize(authSession, [s.management]);
	const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee?.id);
	if (!isManagement && !isChairOfCommittee) return { ok: false, message: "Unauthorized" };

	await prisma.committee.update({
		where: { id: selectedCommittee.id },
		data: { isPositionPaperSubmissionAutoOpen: data },
	});

	return { ok: true, message: "Settings updated." };
}

export async function isPositionPapersVisibleToEveryoneAction(data, selectedCommitteeId) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Unauthorized" };
	const selectedCommittee = await prisma.committee.findUnique({ where: { id: selectedCommitteeId, session: { isCurrent: true } } });
	if (!selectedCommittee) return { ok: false, message: "Session not found" };
	const isManagement = authorize(authSession, [s.management]);
	const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee?.id);
	if (!isManagement && !isChairOfCommittee) return { ok: false, message: "Unauthorized" };

	await prisma.committee.update({
		where: { id: selectedCommittee.id },
		data: { isPositionPapersVisible: data },
	});

	return { ok: true, message: "Settings updated." };
}
