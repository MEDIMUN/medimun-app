"use server";
import { parseFormData } from "@/lib/parse-form-data";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/prisma/client";

export async function inviteCoSubmitter(formData: FormData) {
	const authSession = await auth();

	const resolutionSchema = z.object({
		resolutionId: z.string().trim().max(100),
		delegateId: z.string().trim().max(100),
	});

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const parsedFormData = parseFormData(formData) as any;

	const { data, error } = resolutionSchema.safeParse(parsedFormData);
	if (error) return { ok: false, message: ["Invalid data."] };

	const selectedResolution = await prisma.resolution.findUnique({
		where: {
			id: data.resolutionId,
			status: "DRAFT",
			mainSubmitter: { userId: authSession.user.id },
		},
		include: {
			topic: true,
			mainSubmitter: { include: { user: true } },
			committee: { include: { Topic: true } },
			CoSubmitters: { include: { delegate: { include: { user: true } } } },
			CoSubmitterInvitation: true,
		},
	});

	if (!selectedResolution) return { ok: false, message: ["Could not find resolution."] };

	if (selectedResolution.CoSubmitters.length + selectedResolution.CoSubmitterInvitation.length >= 15) {
		return { ok: false, message: ["Too many co-submitters."] };
	}

	const existingCoSubmitter = selectedResolution.CoSubmitters.find((cosubmitter) => cosubmitter.delegateId === data.cosubmitterId);

	if (existingCoSubmitter) {
		return { ok: false, message: ["User is already a co-submitter."] };
	}

	try {
		await prisma.coSubmitterInvitation.create({
			data: {
				delegateId: data.delegateId,
				resolutionId: selectedResolution.id,
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error inviting co-submitter."],
		};
	}

	return { ok: true, message: ["Co-submitter invited."] };
}

export async function leaveAsCosubmitter(resolutionId) {
	const authSession = await auth();

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedResolution = await prisma.resolution.findUnique({
		where: {
			id: resolutionId,
			status: "DRAFT",
			CoSubmitters: {
				some: {
					delegate: {
						userId: authSession.user.id,
					},
				},
			},
		},
		include: {
			topic: true,
			mainSubmitter: { include: { user: true } },
			committee: { include: { Topic: true } },
			CoSubmitters: { include: { delegate: { include: { user: true } } } },
			CoSubmitterInvitation: true,
		},
	});

	if (!selectedResolution) return { ok: false, message: ["Could not find resolution."] };

	try {
		await prisma.coSubmitters.deleteMany({
			where: {
				delegate: {
					user: {
						id: authSession.user.id,
					},
				},
				resolution: {
					id: selectedResolution.id,
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error leaving as co-submitter."],
		};
	}

	return {
		ok: true,
		message: ["Left as co-submitter."],
	};
}

export async function transferMainSubmitter(resolutionId, coSubmitterId) {
	const authSession = await auth();

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedResolution = await prisma.resolution.findUnique({
		where: {
			id: resolutionId,
			status: "DRAFT",
			mainSubmitter: { userId: authSession.user.id },
		},
		include: {
			topic: true,
			mainSubmitter: { include: { user: true } },
			committee: { include: { Topic: true } },
			CoSubmitters: { include: { delegate: { include: { user: true } } } },
			CoSubmitterInvitation: true,
		},
	});

	if (!selectedResolution) return { ok: false, message: ["Could not find resolution."] };

	if (selectedResolution.CoSubmitters.length + selectedResolution.CoSubmitterInvitation.length >= 15) {
		return { ok: false, message: ["Too many co-submitters."] };
	}

	const selectedDelegate = await prisma.delegate.findUnique({
		where: {
			userId_committeeId: {
				userId: authSession.user.id,
				committeeId: selectedResolution.committeeId,
			},
		},
	});

	if (!selectedDelegate) return { ok: false, message: ["Could not find delegate."] };

	try {
		await prisma.$transaction([
			prisma.resolution.update({
				where: {
					id: resolutionId,
				},
				data: {
					mainSubmitter: {
						connect: {
							id: coSubmitterId,
						},
					},
				},
			}),
			prisma.coSubmitters.create({
				data: {
					resolutionId: resolutionId,
					delegateId: selectedDelegate.id,
				},
			}),
			prisma.coSubmitters.deleteMany({
				where: {
					resolutionId: resolutionId,
					delegateId: coSubmitterId,
				},
			}),
		]);
	} catch (e) {
		return {
			ok: false,
			message: ["Error transferring main submitter."],
		};
	}

	return { ok: true, message: ["Transferred main submitter."] };
}
