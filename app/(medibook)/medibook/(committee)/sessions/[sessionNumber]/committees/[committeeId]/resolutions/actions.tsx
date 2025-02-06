"use server";

import { auth } from "@/auth";
import prisma from "@/prisma/client";

export async function acceptCoSubmitterInvitation(resolutionId) {
	const authSession = await auth();

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedCommittee = await prisma.committee.findFirst({
		where: {
			Resolution: {
				some: {
					id: resolutionId,
				},
			},
		},
	});

	if (!selectedCommittee) return { ok: false, message: ["Could not find committee."] };

	try {
		await prisma.$transaction([
			prisma.coSubmitterInvitation.deleteMany({
				where: {
					resolution: {
						status: "DRAFT",
					},
					delegate: {
						userId: authSession.user.id,
					},
					resolutionId: resolutionId,
				},
			}),
			prisma.coSubmitters.create({
				data: {
					delegate: {
						connect: {
							userId_committeeId: {
								userId: authSession.user.id,
								committeeId: selectedCommittee.id,
							},
						},
					},
					resolution: {
						connect: {
							id: resolutionId,
						},
					},
				},
			}),
		]);
	} catch (e) {
		return {
			ok: false,
			message: ["Error accepting co-submitter invitation."],
		};
	}

	return { ok: true, message: "Co-submitter added." };
}

export async function rejectCoSubmitterInvitation(resolutionId) {
	const authSession = await auth();

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	try {
		await prisma.coSubmitterInvitation.deleteMany({
			where: {
				delegate: {
					userId: authSession.user.id,
				},
				resolutionId: resolutionId,
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error rejecting co-submitter invitation."],
		};
	}

	return { ok: true, message: "Co-submitter invitation rejected." };
}
