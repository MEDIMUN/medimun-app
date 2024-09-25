"use server";

import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";
import { parseFormData } from "@/lib/form";
import prisma from "@/prisma/client";
import { z } from "zod";

export async function createTopic(formData: FormData, selectedCommitteeId) {
	const authSession = await auth();
	if (!authorize(authSession, [s.management])) return { ok: false, message: ["Unauthorized"] };

	const schema = z.object({
		title: z.string(),
		description: z.string().optional().nullable(),
	});

	const selectedCommittee = await prisma.committee.findFirst({ where: { id: selectedCommitteeId } });
	if (!selectedCommittee) return { ok: false, message: ["Invalid committee."] };

	const parsedFormData = parseFormData(formData);
	const { error, data } = schema.safeParse(parsedFormData);
	if (error) return { ok: false, message: ["Invalid data."] };

	try {
		await prisma.topic.create({
			data: {
				...data,
				committeeId: selectedCommittee.id,
			},
		});
	} catch (e) {
		return { ok: false, message: ["Failed to create topic."] };
	}
	return { ok: true, message: ["Topic created."] };
}

export async function editTopic(formData: FormData, selectedTopicId: string) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	const selectedTopic = await prisma.topic.findFirst({
		where: { id: selectedTopicId },
		include: { committee: true },
	});

	if (!selectedTopic) return { ok: false, message: ["Invalid topic."] };
	if (!selectedTopic.committee) return { ok: false, message: ["Invalid committee."] };

	const isAuthorized = isManagement || authorizeChairCommittee(authSession.currentRoles, selectedTopic.committee.id);
	if (!isAuthorized) return { ok: false, message: ["Unauthorized."] };

	const schema = z.object({
		...(isManagement && { title: z.string() }),
		description: z.string().optional().nullable(),
	});

	const parsedFormData = parseFormData(formData);
	const { error, data } = schema.safeParse(parsedFormData);
	if (error) return { ok: false, message: ["Invalid data."] };

	try {
		await prisma.topic.update({
			where: { id: selectedTopic.id },
			data: { ...data },
		});
	} catch (e) {
		return { ok: false, message: ["Failed to update topic."] };
	}
	return { ok: true, message: ["Topic updated."] };
}

export async function deleteTopic(selectedTopicId: string) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: ["Unauthorized."] };

	const selectedTopic = await prisma.topic.findFirst({
		where: { id: selectedTopicId },
		include: { committee: true },
	});

	if (!selectedTopic) return { ok: false, message: ["Invalid topic."] };
	if (!selectedTopic.committee) return { ok: false, message: ["Invalid committee."] };

	try {
		await prisma.topic.delete({ where: { id: selectedTopic.id } });
	} catch (e) {
		return { ok: false, message: ["Failed to delete topic."] };
	}
	return { ok: true, message: ["Topic deleted."] };
}
