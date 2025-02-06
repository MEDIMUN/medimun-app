"use server";

import { parseFormData } from "@/lib/parse-form-data";
import { z } from "zod";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, authorizeManagerDepartment, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { randomUUID } from "crypto";
/* @ts-ignore */
import { minio } from "@/minio/client";
import mimeExt from "mime-ext";
import { entityCase } from "@/lib/text";

export async function createMediWriteResolution(formData: FormData) {
	const authSession = await auth();

	const resolutionSchema = z.object({
		title: z.string().trim().max(100).transform(entityCase),
	});

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const parsedFormData = parseFormData(formData) as any;

	const { data, error } = resolutionSchema.safeParse(parsedFormData);
	if (error) return { ok: false, message: ["Invalid title."] };

	const selectedCommittee = await prisma.committee.findUnique({
		where: { id: parsedFormData?.committeeId },
		include: { session: true },
	});

	if (!selectedCommittee) return { ok: false, message: ["Could not find committee."] };

	const selectedTopic = await prisma.topic.findUnique({
		where: { id: parsedFormData?.topicId },
	});

	if (!selectedTopic) return { ok: false, message: ["Could not find topic."] };

	const isManagement = authorize(authSession, [s.management]);
	const isChair = authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isDelegate = authorizeDelegateCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isSessionCurrent = selectedCommittee.session.isCurrent;

	const isAllowedToAddResolution = (isChair || isDelegate) && isSessionCurrent;
	if (!isAllowedToAddResolution) return { ok: false, message: ["You can't submit resolutions"] };

	try {
		await prisma.resolution.create({
			data: {
				topic: { connect: { id: selectedTopic.id } },
				mainSubmitter: {
					connect: {
						userId_committeeId: {
							userId: authSession.user.id,
							committeeId: selectedCommittee.id,
						},
					},
				},
				committee: {
					connect: { id: selectedCommittee.id },
				},
				title: data.title,
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error creating resolution."],
		};
	}

	return { ok: true, message: "Resolution created." };
}

export async function editResourceDetails(formData: FormData, resourceId: string) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Not authorized" };

	const selectedFile = await prisma.resource.findUnique({
		where: { id: resourceId },
		include: { user: true, session: true, department: { include: { session: true } }, committee: { include: { session: true } } },
	});

	const authorzedToEdit = authorizedToEditResource(authSession, selectedFile);
	if (!authorzedToEdit) return { ok: false, message: "Not authorized" };

	const schema = z.object({
		name: z.string().min(2, "Name must be at least 2 characters long").max(100, "Name must at most 100 characters long"),
		isPrivate: z.boolean(),
		isPinned: z.boolean(),
		isAnonymous: z.boolean(),
	});

	const processedFormData = parseFormData(formData);

	const { data, error } = schema.safeParse(processedFormData);

	if (error) return { ok: false, message: "Invalid Data" };

	const updatedResource = {
		name: data.name,
		isPrivate: data.isPrivate,
		isPinned: data.isPinned,
		isAnonymous: data.isAnonymous,
	};

	try {
		await prisma.resource.update({
			where: { id: resourceId },
			data: updatedResource,
		});
	} catch (e) {
		return { ok: false, message: "Something went wrong." };
	}

	return { ok: true, message: "Resource updated" };
}

export async function deleteResolution(resolutionId: string) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!authSession) return { ok: false, message: ["Not authorized"] };

	const selectedResolution = await prisma.resolution.findUnique({
		where: { id: resolutionId },
		include: { mainSubmitter: true, committee: true },
	});

	if (!selectedResolution) return { ok: false, message: ["Resolution not found."] };

	const selectedCommittee = selectedResolution.committee;

	const isChair = authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isDelegate = authorizeDelegateCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);

	if (
		!(
			(isDelegate &&
				!isChair &&
				!isManagement &&
				selectedResolution?.status === "DRAFT" &&
				selectedResolution.mainSubmitter.userId === authSession.user.id) ||
			(isChair &&
				!isManagement &&
				!!selectedResolution &&
				["DRAFT", "SENT_BACK_TO_COMMITTEE", "SENT_TO_CHAIRS", "IN_DEBATE", "VOTING"].includes(selectedResolution.status)) ||
			isManagement
		)
	) {
		return { ok: false, message: ["Not authorized."] };
	}

	try {
		await prisma.resolution.delete({
			where: {
				id: resolutionId,
				...(isManagement ? {} : { status: "DRAFT" }),
				mainSubmitter: {
					userId: authSession.user.id,
				},
			},
		});
	} catch (e) {
		return { ok: false, message: ["Something went wrong."] };
	}

	return { ok: true, message: ["Resolution deleted."] };
}

//send to approval panel for approval
export async function sendResolutionToApproval(resolutionId: string) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedResolution = await prisma.resolution.findUnique({
		where: { id: resolutionId, status: "SENT_TO_CHAIRS" },
		include: { mainSubmitter: true, committee: true },
	});

	if (!selectedResolution) return { ok: false, message: ["Resolution not found."] };

	const selectedCommittee = selectedResolution.committee;

	const isChair = authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isManagement = authorize(authSession, [s.management]);

	if (!isChair && !isManagement) return { ok: false, message: ["Not authorized."] };

	try {
		await prisma.resolution.update({
			where: { id: resolutionId },
			data: { status: "SENT_TO_APPROVAL_PANEL", CoSubmitterInvitation: { deleteMany: {} } },
		});
	} catch (e) {
		return { ok: false, message: ["Something went wrong."] };
	}

	return { ok: true, message: ["Resolution sent for approval."] };
}
