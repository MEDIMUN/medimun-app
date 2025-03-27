import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { socketAuth } from "@/socket/auth";
import prisma from "@/prisma/client";
import type { Clause, ClauseType } from "@/types/clause";
import { authorize, authorizeChairCommittee, authorizeChairDelegate, authorizeDelegateCommittee, authorizeDirect, authorizeManagerDepartment, authorizeMemberDepartment, s } from "@/lib/authorize";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import { handleSocketRollCall } from "./roll-call";
import { privateMessageHandler } from "./private-message";
import { committeeMessageHandler } from "./committee-message";
import { ClauseUpdateEvent, SubClauseUpdateEvent, SubSubClauseUpdateEvent } from "@/types/socket-events";
import { handleCreateClause, handleJoinResolution, handleUpdateClause } from "./resolution";

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
			/////////////////////////////////
			socket.on("join-resolution", (resolutionId: string) => {
				handleJoinResolution(socket, resolutionId);
			});

			socket.on("clause:create", async (event: { type: ClauseType; clause: Omit<Clause, "id">; resolutionId: string }) => {
				await handleCreateClause(io, socket, event);
			});

			socket.on("clause:update", async (event: ClauseUpdateEvent) => {
				await handleUpdateClause(io, socket, event);
			});

			///////////////////////////////////

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
				const isChairOfCommittee = authorizeChairCommittee(authSession?.user?.currentRoles?.concat(authSession?.user?.pastRoles), selectedCommitteeId);
				const isDelegateOfCommittee = authorizeDelegateCommittee(authSession?.user?.currentRoles?.concat(authSession?.user?.pastRoles), selectedCommitteeId);

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
					isMember && authSession?.user.currentRoles.filter((role) => role.roleIdentifier == "member").filter((role) => role?.departmentTypes?.some((type) => allowedMemberDepartmentTypes?.includes(type))).length > 0;

				const userRegistered = await prisma.morningPresent.findUnique({
					where: { userId_dayId: { dayId: selectedCode.day.id, userId: selectedCode.userId } },
				});

				//departmentTypes is an array within each department object that contains the department types that are allowed to register

				function unauthorizedSocket() {
					socket.nsp.to(`private-user-${authSession?.user.id}`).emit("toast.error", "Unauthorized");
				}

				const isManagementOrManager = isManagement || isManager;

				if (!isManagementOrManager && !isMemberOfPIorIT) return unauthorizedSocket;
				if (isMemberOfPIorIT && !isManagementOrManager) {
					const scanningUserRegistered = await prisma.morningPresent
						.findUnique({
							where: { userId_dayId: { dayId: selectedCode.day.id, userId: authSession.user.id } },
						})
						.catch((error) => {
							socket.nsp.to(`private-user-${authSession?.user.id}`).emit("toast.error", "Error checking if user is registered.");
							return;
						});
					if (!scanningUserRegistered) return unauthorizedSocket;
				}

				if (userRegistered) {
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
				const isChairOfCommittee = authSession && authorizeChairCommittee([...authSession?.user.currentRoles, ...authSession?.user.pastRoles], selectedCommittee.id);
				const isDelegateOfCommittee = authSession && authorizeDelegateCommittee([...authSession?.user.currentRoles, ...authSession?.user.pastRoles], selectedCommittee.id);

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
				const isManagerOfDepartment = authSession && authorizeManagerDepartment([...authSession?.user.currentRoles, ...authSession?.user.pastRoles], selectedDepartment.id);

				const isMemberOfDepartment = authSession && authorizeMemberDepartment([...authSession?.user.currentRoles, ...authSession?.user.pastRoles], selectedDepartment.id);

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

			socket.on("join:committee-chat", async (groupId) => {
				const authSession = await socketAuth(socket);
				if (!authSession) {
					socket.emit("error", "Unauthorized");
					return;
				}
				const selectedGroup = await prisma.committee.findUnique({
					where: {
						id: groupId,
						...(authorize(authSession, [s.management])
							? {}
							: {
									OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
								}),
					},
				});
				if (!selectedGroup) return socket.emit("error", "Group not found");
				socket.join(`room:committee-chat-${groupId}`);
				socket.nsp.to(`private-user-${authSession.user.id}`).emit("joined:committee-chat", groupId);
			});
			//////
			socket.on("update:private-message", async ({ groupId, messageId, action, data, replyToId, clientId }) => {
				privateMessageHandler(socket, { groupId, messageId, action, data, replyToId, clientId });
			});

			socket.on("update:committee-chat", async ({ groupId, messageId, action, data, replyToId, clientId }) => {
				committeeMessageHandler(socket, { groupId, messageId, action, data, replyToId, clientId });
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
		});
	}

	return global.io;
};

export const getSocketInstance = (): Server | undefined => global.io;
