import prisma from "@/prisma/client";
import { socketAuth } from "./auth";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";

export async function committeeMessageHandler(socket, { groupId, messageId, action, data, replyToId, clientId }) {
	const authSession = await socketAuth(socket);
	if (!authSession) return socket.emit("error", "Unauthorized");
	const isManagement = authorize(authSession, [s.management]);
	const isChairOfCommittee = authorizeChairCommittee(authSession.user.currentRoles, groupId);

	if (action === "DELETE") {
		const selectedMessage = await prisma.committeeMessage.update({
			where: { id: messageId, ...(isManagement || isChairOfCommittee ? {} : { userId: authSession.user.id }) },
			include: { user: true },
			data: { isDeleted: true },
		});
		socket.to(`room:committee-chat-${groupId}`).emit("update:committee-chat", "UPDATE", selectedMessage);
	}
	if (action === "EDIT") {
		const selectedMessage = await prisma.committeeMessage.update({
			where: { id: messageId, ...(isManagement || isChairOfCommittee ? {} : { userId: authSession.user.id }) },
			include: {
				user: {
					select: {
						id: true,
						officialName: true,
						officialSurname: true,
						displayName: true,
					},
				},
			},
			data: { markdown: data },
		});
		socket.to(`room:committee-chat-${groupId}`).emit("update:committee-chat", "UPDATE", selectedMessage);
	}
	if (action === "REPLY") {
		const selectedMessage = await prisma.committeeMessage.findFirst({
			where: {
				id: replyToId,
				...(isManagement
					? {}
					: {
							committee: {
								OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
							},
						}),
			},
		});

		if (!selectedMessage) return socket.emit("error", "Message not found");

		const newMessage = await prisma.committeeMessage.create({
			data: {
				committeeId: selectedMessage.committeeId,
				replyToId,
				userId: authSession.user.id,
				markdown: data,
				isDeleted: false,
			},
			include: {
				user: {
					select: {
						id: true,
						officialName: true,
						officialSurname: true,
						displayName: true,
					},
				},
				replyTo: {
					include: {
						user: {
							select: {
								id: true,
								officialName: true,
								officialSurname: true,
								displayName: true,
							},
						},
					},
				},
			},
		});
		socket.emit("update:message-id", "UPDATE", clientId, newMessage);
		socket.to(`room:committee-chat-${groupId}`).emit("update:committee-chat", "NEW", newMessage);
	}
	if (action === "NEW") {
		const selectedGroup = await prisma.committee.findUnique({
			where: {
				id: groupId,
				...(isManagement
					? {}
					: { OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }] }),
			},
		});
		if (!selectedGroup) return socket.emit("error", "Group not found");
		const newMessage = await prisma.committeeMessage.create({
			data: {
				committeeId: selectedGroup.id,
				userId: authSession.user.id,
				markdown: data,
				isDeleted: false,
			},
			include: {
				user: {
					select: {
						id: true,
						officialName: true,
						officialSurname: true,
						displayName: true,
					},
				},
				CommitteeMessageReaction: {
					include: {
						user: {
							select: {
								id: true,
								officialName: true,
								officialSurname: true,
								displayName: true,
							},
						},
					},
				},
			},
		});
		socket.emit("update:message-id", "UPDATE", clientId, newMessage);
		socket.to(`room:committee-chat-${groupId}`).emit("update:committee-chat", "NEW", newMessage);
	}
	if (action === "REACTION") {
		const selectedMessage = await prisma.committeeMessage.findFirst({
			where: {
				id: messageId,
				...(isManagement
					? {}
					: { committee: { OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }] } }),
			},
		});

		if (!selectedMessage) {
			socket.emit("error", "Message not found");
			return;
		}

		if (data === null) {
			await prisma.committeeMessageReaction.delete({
				where: {
					userId_messageId: {
						userId: authSession.user.id,
						messageId,
					},
				},
			});
		}
		const newReaction = await prisma.committeeMessageReaction.upsert({
			where: {
				userId_messageId: {
					userId: authSession.user.id,
					messageId,
				},
			},
			include: { user: true },
			update: { reaction: data },
			create: {
				userId: authSession.user.id,
				messageId,
				reaction: data,
			},
		});

		const finalMessage = await prisma.committeeMessage.findFirst({
			where: { id: messageId },
			include: {
				user: {
					select: {
						id: true,
						officialName: true,
						officialSurname: true,
						displayName: true,
					},
				},
				CommitteeMessageReaction: {
					include: {
						user: {
							select: {
								id: true,
								officialName: true,
								officialSurname: true,
								displayName: true,
							},
						},
					},
				},
			},
		});
		socket.to(`room:committee-chat-${groupId}`).emit("update:committee-chat", "UPDATE", finalMessage);
		//typing
		if (action === "TYPING") {
			socket.to(`room:committee-chat-${groupId}`).emit("update:committee-chat", "TYPING", authSession.user.id);
		}
	}
}
