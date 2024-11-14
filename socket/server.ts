import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { socketAuth } from "@/socket/auth";
import prisma from "@/prisma/client";
import {
	authorize,
	authorizeChairCommittee,
	authorizeChairDelegate,
	authorizeDelegateCommittee,
	authorizeDirect,
	authorizeManagerDepartment,
	authorizeMemberDepartment,
	s,
} from "@/lib/authorize";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import { handleSocketRollCall } from "./roll-call";

declare global {
	var io: Server | undefined;
}

export const initializeSocket = (server: any): Server => {
	if (!global.io) {
		console.log("Initializing Socket.IO...");
		global.io = new Server(server, {
			transports: ["websocket"],
			addTrailingSlash: false,
		});

		// Set up Redis adapter for pub/sub
		const pubClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
		pubClient.on("error", (error) => console.error("Redis pubClient error:", error));
		const subClient = pubClient.duplicate();
		subClient.on("error", (error) => console.error("Redis subClient error:", error));
		global.io.adapter(createAdapter(pubClient, subClient));

		pubClient.on("error", (error) => console.error("Redis pubClient error:", error));
		subClient.on("error", (error) => console.error("Redis subClient error:", error));

		global.io.on("connection", async (socket) => {
			const authSession = await socketAuth(socket);
			socket.user = authSession.user;

			if (!authSession) {
				socket.disconnect();
				return;
			}

			socket.join(`private-user-${authSession?.user.id}`);

			socket.on("join-room-delegate-assignment", async (sessionId) => {
				const authSession = await socketAuth(socket);
				const isManagement = authorize(authSession, [s.management]);
				if (!authSession && !isManagement) {
					socket.emit("error", "Unauthorized");
					return;
				}
				await socket.join(`room:delegate-assignment-${sessionId}`);
			});

			/* 			const handleJoinRoom = async () => {
				await new Promise((resolve) => setTimeout(resolve, 250));
				try {
					socket.emit(`join:committee-roll-calls`, selectedCommittee.id);
				} catch {
				} finally {
					setIsLoading(false);
				}
			}; */

			socket.on("update:committee-roll-call", async ({ dayId, rollCallId, userId, type, action }) => {
				handleSocketRollCall(socket, { dayId, rollCallId, userId, type, action });
			});

			socket.on("join:committee-roll-calls", async (selectedCommitteeId, selectedDayId) => {
				const authSession = await socketAuth(socket);
				const isManagement = authorize(authSession, [s.management]);
				const selectedCommittee = await prisma.committee.findUnique({
					where: { id: selectedCommitteeId },
					include: { session: { select: { Day: true } } },
				});
				const selectedDay = selectedCommittee.session.Day.find((day) => day.id === selectedDayId);
				if (!selectedDay) {
					socket.emit("error", "Day not found");
					return;
				}
				if (!selectedCommittee) {
					socket.emit("error", "Committee not found");
					return;
				}
				const isChairOfCommittee = authorizeChairCommittee(
					authSession?.user?.currentRoles?.concat(authSession?.user?.pastRoles),
					selectedCommitteeId
				);
				const isDelegateOfCommittee = authorizeDelegateCommittee(
					authSession?.user?.currentRoles?.concat(authSession?.user?.pastRoles),
					selectedCommitteeId
				);

				if (!isManagement && !isChairOfCommittee && !isDelegateOfCommittee) {
					socket.emit("error", "Unauthorized");
					return;
				}
				socket.join(`room:committee-roll-calls-${selectedDayId}`);
				socket.nsp.to(`private-user-${authSession?.user.id}`).emit("joined:committee-roll-calls", selectedDayId);
			});

			// Message Group Room
			socket.on("join-message-group", (groupId) => {
				socket.join(`msg-group-${groupId}`);
				socket.to(`msg-group-${groupId}`).emit("user-joined", `${socket.id} joined message group ${groupId}`);
			});

			socket.on("morning-register", async (msg) => {
				const authSession = await socketAuth(socket);
				if (!authSession) {
					socket.nsp.to(`private-user-${authSession?.user.id}`).emit("toast.error", "Unauthorized");
					return;
				}

				const selectedCode = await prisma.morningCode
					.findUnique({
						where: { code: msg, day: { date: new Date().toISOString().split("T")[0].concat("T00:00:00.000Z") } },
						include: { day: true, user: { include: { ...generateUserDataObject() } } },
					})
					.catch((error) => {
						socket.nsp.to(`private-user-${authSession?.user.id}`).emit("toast.error", "Invalid QR code.");
						return;
					});

				if (!selectedCode) return socket.nsp.to(`private-user-${authSession?.user.id}`).emit("toast.error", "Invalid QR code.");

				const isManagement = authorize(authSession, [s.management]);
				const isMember = authorizeDirect(authSession, [s.member]);
				const isManager = authorizeDirect(authSession, [s.manager]);
				const allowedMemberDepartmentTypes = ["PI", "IT", "ADMIN"];
				const isMemberOfPIorIT =
					isMember &&
					authSession?.user.currentRoles
						.filter((role) => role.roleIdentifier == "member")
						.filter((role) => role?.departmentTypes?.some((type) => allowedMemberDepartmentTypes?.includes(type))).length > 0;

				const usersRegistered = await prisma.morningPresent.findUnique({
					where: { userId_dayId: { dayId: selectedCode.day.id, userId: authSession.user.id } },
				});

				//departmentTypes is an array within each department object that contains the department types that are allowed to register

				function unauthorizedSocket() {
					socket.nsp.to(`private-user-${authSession?.user.id}`).emit("toast.error", "Unauthorized");
				}

				if (!isManagement && !isMemberOfPIorIT && !isManager) return unauthorizedSocket;
				if (isMemberOfPIorIT && !isManagement && !usersRegistered) return unauthorizedSocket;

				if (usersRegistered) {
					await prisma.morningCode.deleteMany({
						where: { userId: selectedCode.userId },
					});
					socket.nsp.to(`private-user-${authSession?.user.id}`).emit("toast.info", "User already registered.");
				} else {
					try {
						await prisma.$transaction([
							prisma.morningCode.deleteMany({
								where: { userId: selectedCode.user.id },
							}),
							prisma.morningPresent.create({
								data: { dayId: selectedCode.day.id, userId: selectedCode.userId },
							}),
						]);
					} catch (error) {
						socket.nsp.to(`private-user-${authSession?.user.id}`).emit("toast.error", ["Error adding morning register"]);
						return;
					}
					socket.nsp.to(`private-user-${authSession?.user.id}`).emit("toast.success", "Morning register added");
					socket.to(`private-user-${selectedCode.userId}`).emit("toast.success", "You have been registered for today.");
					socket.to(`private-user-${selectedCode.userId}`).emit("router.refresh");
				}
			});

			socket.on("join-committee-global", async (committeeId) => {
				const selectedCommittee = await prisma.committee.findUnique({
					where: { id: committeeId },
					include: { session: true },
				});

				if (!selectedCommittee) {
					socket.emit("error", "Committee not found");
					return;
				}
				const authSession = await socketAuth(socket);
				const isChairOfCommittee =
					authSession && authorizeChairCommittee([...authSession?.user.currentRoles, ...authSession?.user.pastRoles], selectedCommittee.id);
				const isDelegateOfCommittee =
					authSession && authorizeDelegateCommittee([...authSession?.user.currentRoles, ...authSession?.user.pastRoles], selectedCommittee.id);

				if (!isChairOfCommittee && !isDelegateOfCommittee) {
					socket.emit("error", "Unauthorized");
					return;
				}

				socket.join(`committee-global-${committeeId}`);
			});

			socket.on("join-department-global", async (departmentId) => {
				const selectedDepartment = await prisma.department.findUnique({
					where: { id: departmentId },
					include: { session: true },
				});

				if (!selectedDepartment) {
					socket.emit("error", "Department not found");
					return;
				}
				const authSession = await socketAuth(socket);
				const isManagerOfDepartment =
					authSession && authorizeManagerDepartment([...authSession?.user.currentRoles, ...authSession?.user.pastRoles], selectedDepartment.id);

				const isMemberOfDepartment =
					authSession && authorizeMemberDepartment([...authSession?.user.currentRoles, ...authSession?.user.pastRoles], selectedDepartment.id);

				if (!isManagerOfDepartment && !isMemberOfDepartment) {
					socket.emit("error", "Unauthorized");
					return;
				}

				socket.join(`department-global-${departmentId}`);
			});

			// Teams Room
			socket.on("join-team", (committeeId) => {
				socket.join(`team-${committeeId}`);
				socket.to(`team-${committeeId}`).emit("user-joined", `User ${socket.id} joined team ${committeeId}`);
			});

			// Global Events & Notifications Room
			socket.on("join-global-events", () => {
				socket.join("global-events");
			});

			//global leave room
			socket.on("leave-room", (room) => {
				socket.leave(`room:${room}`);
			});

			socket.on("join:private-group", async (groupId) => {
				const authSession = await socketAuth(socket);
				if (!authSession) {
					socket.emit("error", "Unauthorized");
					return;
				}
				const selectedGroup = await prisma.group.findUnique({
					where: { id: groupId, GroupMember: { some: { userId: authSession.user.id } } },
				});
				if (!selectedGroup) return socket.emit("error", "Group not found");
				socket.join(`room:private-group-${groupId}`);
				socket.nsp.to(`private-user-${authSession.user.id}`).emit("joined:private-group", groupId);
			});

			socket.on("update:private-message", async ({ groupId, messageId, action, data, replyToId, clientId }) => {
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
			});

			socket.on("update:delegation-proposal", async (sessionId, proposalId, data) => {
				const authSession = await socketAuth(socket);
				const isManagement = authorize(authSession, [s.management]);
				if (!isManagement) {
					socket.emit("error", "Unauthorized");
					return;
				}
				socket.to(`room:delegate-assignment:${sessionId}`).emit("update:delegation-proposal", proposalId, data);
			});

			// Voting Room
			socket.on("join-voting-room", (committeeId) => {
				socket.join(`vote-${committeeId}`);
				socket.to(`vote-${committeeId}`).emit("voting-started", `Voting started for committee ${committeeId}`);
			});

			// Original 'input-change' event
			socket.on("input-change", async (msg) => {
				const session = await socketAuth(socket);
				console.dir(session.user, {
					deph: 100,
				});
				socket.broadcast.emit("update-input", msg);
			});

			socket.on("disconnect", () => {
				console.log(`User ${socket.user.id} disconnected`);
			});
		});
	}

	return global.io;
};

export const getSocketInstance = (): Server | undefined => global.io;
