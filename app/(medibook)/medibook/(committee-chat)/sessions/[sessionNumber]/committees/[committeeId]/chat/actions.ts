"use server";

import { auth } from "@/auth";
import prisma from "@/prisma/client";

export async function loadMoreMessages(groupId: string, skip: number) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: ["User not found"], data: { messages: [] } };
	const selectedGroup = await prisma.committee.findFirst({
		where: { id: groupId, delegate: { some: { userId: authSession.user.id } } },
		include: {
			CommitteeMessage: {
				take: 50,
				skip: skip,
				orderBy: { createdAt: "desc" },
				include: {
					replyTo: {
						include: {
							user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } },
						},
					},
					user: {
						select: {
							id: true,
							officialName: true,
							displayName: true,
							officialSurname: true,
						},
					},
				},
			},
		},
	});
	if (!selectedGroup) return { ok: false, message: ["committee not found"], data: { messages: [] } };
	const messages = selectedGroup.CommitteeMessage;
	return { ok: true, message: [], data: { messages } };
}
