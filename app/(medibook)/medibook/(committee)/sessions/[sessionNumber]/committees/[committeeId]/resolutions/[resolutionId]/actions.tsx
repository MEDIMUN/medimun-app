"use server";

import { auth } from "@/auth";
import { parseFormData } from "@/lib/parse-form-data";
import prisma from "@/prisma/client";
import { z } from "zod";

export async function removeCoSubmitter(resolutionId, delegateId) {
	const authSession = await auth();

	const resolutionSchema = z.object({
		resolutionId: z.string().trim().max(100),
		delegateId: z.string().trim().max(100),
	});

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const parsedFormData = {
		resolutionId: resolutionId,
		delegateId: delegateId,
	};

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

	const existingCoSubmitter = selectedResolution.CoSubmitters.find((cosubmitter) => cosubmitter.delegateId === data.delegateId);

	if (!existingCoSubmitter) {
		return { ok: false, message: ["User is not a co-submitter."] };
	}

	try {
		await prisma.coSubmitters.delete({
			where: {
				delegateId_resolutionId: {
					delegateId: data.delegateId,
					resolutionId: selectedResolution.id,
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error removing co-submitter."],
		};
	}

	return {
		ok: true,
		message: "Co-submitter removed.",
	};
}

export async function removeCoSubmitterInvitation(resolutionId, delegateId) {
	const authSession = await auth();

	const resolutionSchema = z.object({
		resolutionId: z.string().trim().max(100),
		delegateId: z.string().trim().max(100),
	});

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const parsedFormData = {
		resolutionId: resolutionId,
		delegateId: delegateId,
	};

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

	const existingCoSubmitter = selectedResolution.CoSubmitterInvitation.find((cosubmitter) => cosubmitter.delegateId === data.delegateId);

	if (!existingCoSubmitter) {
		return { ok: false, message: ["User is not a co-submitter."] };
	}

	try {
		await prisma.coSubmitterInvitation.delete({
			where: {
				delegateId_resolutionId: {
					delegateId: data.delegateId,
					resolutionId: selectedResolution.id,
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error removing co-submitter."],
		};
	}

	return {
		ok: true,
		message: "Co-submitter removed.",
	};
}

export async function submitResolutionToChairs(resolutionId) {
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

	try {
		await prisma.resolution.update({
			where: {
				id: resolutionId,
			},
			data: {
				status: "SENT_TO_CHAIRS",
				CoSubmitterInvitation: {
					deleteMany: {},
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error submitting resolution."],
		};
	}

	return { ok: true, message: "Resolution submitted." };
}
