import prisma from "@/prisma/client";
import { socketAuth } from "./auth";

export async function privateMessageHandler(socket, { groupId, messageId, action, data, replyToId, clientId }) {
	const authSession = await socketAuth(socket);
	if (!authSession) return socket.emit("error", "Unauthorized");

	if (action === "DELETE") {
		const selectedMessage = await prisma.message.update({
			where: { id: messageId, userId: authSession.user.id },
			include: { user: true },
			data: { isDeleted: true },
		});
		socket.to(`room:private-group-${groupId}`).emit("update:private-message", "UPDATE", selectedMessage);
	}
	if (action === "EDIT") {
		const selectedMessage = await prisma.message.update({
			where: { id: messageId, userId: authSession.user.id },
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
		socket.to(`room:private-group-${groupId}`).emit("update:private-message", "UPDATE", selectedMessage);
	}
	if (action === "REPLY") {
		const selectedMessage = await prisma.message.findFirst({
			where: {
				id: replyToId,
				group: {
					GroupMember: { some: { userId: authSession.user.id } },
				},
			},
		});

		if (!selectedMessage) {
			socket.emit("error", "Message not found");
			return;
		}

		const newMessage = await prisma.message.create({
			data: {
				groupId: selectedMessage.groupId,
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
		socket.to(`room:private-group-${groupId}`).emit("update:private-message", "NEW", newMessage);
	}
	if (action === "NEW") {
		const selectedGroup = await prisma.group.findUnique({
			where: { id: groupId, GroupMember: { some: { userId: authSession.user.id } } },
		});
		if (!selectedGroup) return socket.emit("error", "Group not found");
		const newMessage = await prisma.message.create({
			data: {
				groupId: selectedGroup.id,
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
				MessageReaction: {
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
		socket.to(`room:private-group-${groupId}`).emit("update:private-message", "NEW", newMessage);
	}
	if (action === "REACTION") {
		const selectedMessage = await prisma.message.findFirst({
			where: {
				id: messageId,
				group: {
					GroupMember: { some: { userId: authSession.user.id } },
				},
			},
		});

		if (!selectedMessage) {
			socket.emit("error", "Message not found");
			return;
		}

		if (data === null) {
			await prisma.messageReaction.delete({
				where: {
					userId_messageId: {
						userId: authSession.user.id,
						messageId,
					},
				},
			});
		}
		const newReaction = await prisma.messageReaction.upsert({
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

		const finalMessage = await prisma.message.findFirst({
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
				MessageReaction: {
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
		socket.to(`room:private-group-${groupId}`).emit("update:private-message", "UPDATE", finalMessage);
		//typing
		if (action === "TYPING") {
			socket.to(`room:private-group-${groupId}`).emit("update:private-message", "TYPING", authSession.user.id);
		}
	}
}
