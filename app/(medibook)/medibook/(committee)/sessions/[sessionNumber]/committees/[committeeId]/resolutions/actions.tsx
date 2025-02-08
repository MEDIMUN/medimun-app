"use server";

import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { redirect } from "next/navigation";

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

export async function makeDraftAgain({ resolutionId, pathName }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	try {
		await prisma.resolution.update({
			where: {
				id: resolutionId,
				status: { in: ["SENT_TO_CHAIRS", "SENT_BACK_TO_COMMITTEE"] },
				...(isManagement ? {} : { committee: { chair: { some: { userId: authSession.user.id } } } }),
			},
			data: { status: "DRAFT" },
		});
	} catch (e) {
		return { ok: false, message: ["Error making resolution a draft again."] };
	}
	return redirect(pathName);
}

export async function sendToChairsByChairs({ resolutionId, pathName }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	try {
		const selectedResolution = await prisma.resolution.update({
			where: {
				id: resolutionId,
				status: { in: ["DRAFT"] },
				...(isManagement ? {} : { committee: { chair: { some: { userId: authSession.user.id } } } }),
			},
			data: { status: "SENT_TO_CHAIRS" },
		});
	} catch (e) {
		return { ok: false, message: ["Error making resolution a draft again."] };
	}
	return redirect(pathName);
}

export async function setAsAdopted({ resolutionId, pathName }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	try {
		await prisma.resolution.update({
			where: {
				id: resolutionId,
				status: { in: ["SENT_BACK_TO_COMMITTEE", "IN_DEBATE", "VOTING"] },
				...(isManagement ? {} : { committee: { chair: { some: { userId: authSession.user.id } } } }),
			},
			data: { status: "ADOPTED" },
		});
	} catch (e) {
		return { ok: false, message: ["Error"] };
	}
	return redirect(pathName);
}

export async function setAsFailed({ resolutionId, pathName }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	try {
		await prisma.resolution.update({
			where: {
				id: resolutionId,
				status: { in: ["SENT_BACK_TO_COMMITTEE", "IN_DEBATE", "VOTING"] },
				...(isManagement ? {} : { committee: { chair: { some: { userId: authSession.user.id } } } }),
			},
			data: { status: "FAILED" },
		});
	} catch (e) {
		return { ok: false, message: ["Error"] };
	}
	return redirect(pathName);
}

export async function putUnderDebate({ resolutionId, pathName }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	if (!authSession) return { ok: false, message: ["Unauthorized"] };
	try {
		await prisma.$transaction([
			prisma.resolution.update({
				where: {
					id: resolutionId,
					status: { in: ["SENT_BACK_TO_COMMITTEE"] },
					...(isManagement ? {} : { committee: { chair: { some: { userId: authSession.user.id } } } }),
				},
				data: { status: "IN_DEBATE" },
			}),
			prisma.resolution.updateMany({
				where: {
					NOT: { id: resolutionId },
					committee: {
						Resolution: {
							some: {
								id: resolutionId,
							},
						},
					},
					status: { in: ["IN_DEBATE", "VOTING"] },
				},
				data: { status: "SENT_BACK_TO_COMMITTEE" },
			}),
		]);
	} catch (e) {
		return { ok: false, message: ["Error"] };
	}
	return redirect(pathName);
}
