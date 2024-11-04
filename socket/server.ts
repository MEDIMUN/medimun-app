import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { socketAuth } from "@/socket/auth";
import prisma from "@/prisma/client";
import {
	authorize,
	authorizeChairCommittee,
	authorizeDelegateCommittee,
	authorizeDirect,
	authorizeManagerDepartment,
	authorizeMemberDepartment,
	s,
} from "@/lib/authorize";
import { generateUserDataObject } from "@/lib/user";

declare global {
	var io: Server | undefined;
}

export const initializeSocket = (server: any): Server => {
	if (!global.io) {
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
			// Example auth call (to be replaced as you implement your specific auth)
			const authSession = await socketAuth(socket);

			if (!authSession) {
				socket.disconnect();
				return;
			}

			console.log("User connected", authSession.user.id);
			socket.user = authSession.user;
			socket.join(`private-user-${authSession?.user.id}`);

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

			// Roll Call Room (for committee chairs)
			socket.on("join-roll-call", (committeeId) => {
				socket.join(`roll-call-${committeeId}`);
				socket.to(`roll-call-${committeeId}`).emit("chair-joined", `Chair ${socket.id} joined roll call`);
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
