"use server";

import { auth } from "@/auth";
import prisma from "@/prisma/client";

export async function loadMoreMessages(groupId: string, skip: number) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: ["User not found"], data: { messages: [] } };
	const selectedGroup = await prisma.group.findFirst({
		where: { id: groupId, GroupMember: { some: { userId: authSession.user.id } } },
		include: {
			Message: {
				take: 50,
				skip: skip,
				orderBy: { createdAt: "desc" },
				include: {
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
	if (!selectedGroup) return { ok: false, message: ["Group not found"], data: { messages: [] } };
	const messages = selectedGroup.Message;
	return { ok: true, message: [], data: { messages } };
}
