"use server";

import { auth } from "@/auth";
import { authorize, authorizeManagerDepartmentType, s } from "@/lib/authorize";
import prisma from "@/prisma/client";

export async function assignResolutionToEditor({ resolutionId, memberId }) {
	try {
		const authSession = await auth();
		const isManagement = authorize(authSession, [s.management]);
		const isManagerOfAp = authorizeManagerDepartmentType(authSession?.currentRoles, ["APPROVAL"]);

		if (!isManagement && !isManagerOfAp) {
			return { ok: false, message: ["You are not authorized to perform this action"] };
		}

		const selectedResolution = await prisma.resolution.findFirst({
			where: {
				id: resolutionId,
			},
		});

		if (!selectedResolution) {
			return { ok: false, message: ["Resolution not found"] };
		}

		const member = await prisma.member.findFirst({
			where: {
				id: Number(memberId),
			},
		});

		if (!member) {
			return { ok: false, message: ["Member not found"] };
		}

		await prisma.resolution.update({
			where: {
				id: resolutionId,
			},
			data: {
				editor: {
					connect: {
						id: Number(memberId),
					},
				},
				status: "ASSIGNED_TO_EDITOR",
			},
		});
	} catch (error) {
		return { ok: false, message: ["Failed to assign resolution to editor"] };
	}

	return { ok: true, message: ["Resolution assigned to editor"] };
}

export async function removeResolutionFromEditor({ resolutionId }) {
	try {
		const authSession = await auth();
		const isManagement = authorize(authSession, [s.management]);
		const isManagerOfAp = authorizeManagerDepartmentType(authSession?.currentRoles, ["APPROVAL"]);

		if (!isManagement && !isManagerOfAp) {
			return { ok: false, message: ["You are not authorized to perform this action"] };
		}

		const selectedResolution = await prisma.resolution.findFirst({
			where: {
				id: resolutionId,
			},
		});

		if (!selectedResolution) {
			return { ok: false, message: ["Resolution not found"] };
		}

		await prisma.resolution.update({
			where: {
				id: resolutionId,
			},
			data: {
				editor: {
					disconnect: true,
				},
				status: "SENT_TO_APPROVAL_PANEL",
			},
		});
	} catch (error) {
		return { ok: false, message: ["Failed to remove resolution from editor"] };
	}

	return { ok: true, message: ["Resolution removed from editor"] };
}

//to approve a reolution  you need to be (management) OR (manager of approval panel in the same session as the resolution) OR (member of approval panel in the same session as the resolution and the resolution is assigned to you)

export async function approveResolution({ resolutionId }) {
	try {
		const authSession = await auth();
		const isManagement = authorize(authSession, [s.management]);
		const isMemberOfAp = authorize(authSession, [s.member]);
		const isManagerOfAp = authorizeManagerDepartmentType(authSession?.currentRoles, ["APPROVAL"]);

		if (!authSession) {
			return { ok: false, message: ["You are not authorized to perform this action"] };
		}

		if (!isManagement && !isManagerOfAp && !isMemberOfAp) {
			return { ok: false, message: ["You are not authorized to perform this action"] };
		}

		const selectedResolution = await prisma.resolution.findFirst({
			where: {
				id: resolutionId,
			},
			include: {
				editor: true,
			},
		});

		if (!selectedResolution) {
			return { ok: false, message: ["Resolution not found"] };
		}

		if (!isManagement && !isManagerOfAp && selectedResolution.editor && selectedResolution.editor.userId !== authSession.user.id) {
			return { ok: false, message: ["You are not authorized to perform this action"] };
		}

		await prisma.resolution.update({
			where: {
				id: resolutionId,
			},
			data: {
				status: "SENT_BACK_TO_MANAGER",
			},
		});
	} catch (error) {
		return { ok: false, message: ["Failed to approve resolution"] };
	}

	return { ok: true, message: ["Resolution approved"] };
}

export async function sendResolutionBackToCommittee({ resolutionId }) {
	try {
		const authSession = await auth();
		const isManagement = authorize(authSession, [s.management]);
		const isManagerOfAp = authorizeManagerDepartmentType(authSession?.currentRoles, ["APPROVAL"]);

		if (!authSession) {
			return { ok: false, message: ["You are not authorized to perform this action"] };
		}

		if (!isManagement && !isManagerOfAp) {
			return { ok: false, message: ["You are not authorized to perform this action"] };
		}

		const selectedResolution = await prisma.resolution.findFirst({
			where: {
				id: resolutionId,
			},
			include: {
				editor: true,
			},
		});

		if (!selectedResolution) {
			return { ok: false, message: ["Resolution not found"] };
		}

		await prisma.resolution.update({
			where: {
				id: resolutionId,
			},
			data: {
				status: "SENT_BACK_TO_COMMITTEE",
				editor: {
					disconnect: true,
				},
			},
		});
	} catch (error) {
		return { ok: false, message: ["Failed to approve resolution"] };
	}

	return { ok: true, message: ["Resolution approved"] };
}
