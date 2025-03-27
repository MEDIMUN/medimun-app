import prisma from "@/prisma/client";
import { socketAuth } from "./auth";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import { authorize, authorizeChairDelegate, s } from "@/lib/authorize";

export async function handleSocketRollCall(socket, { dayId, rollCallId, userId, type, action }) {
	const authSession = await socketAuth(socket);
	const selectedUserPre = await prisma.user.findUnique({
		where: { id: userId },
		include: { ...generateUserDataObject() },
		omit: { signature: true },
	});
	if (!selectedUserPre) {
		socket.emit("error", "User not found");
		return;
	}
	const selectedUser = generateUserData(selectedUserPre);
	const isManagement = authorize(authSession, [s.management]);
	const isChairOfUser = authorizeChairDelegate(authSession?.user?.currentRoles, selectedUser?.pastRoles?.concat(selectedUser?.currentRoles));
	const isAuthorized = isManagement || isChairOfUser;
	if (!isAuthorized) {
		socket.emit("error", "Unauthorized");
		return;
	}
	if (type == "MORNING") {
		if (action == "PRESENT") {
			try {
				await prisma.morningPresent.create({
					data: { dayId, userId },
				});
			} catch (error) {
				return socket.emit("error", "Error updating roll call");
			}
			socket.to(`room:morning-register-${dayId}`).emit("update:morning-register", { dayId, rollCallId, userId, type, action });
			socket.to(`room:committee-roll-calls-${dayId}`).emit("update:morning-register", { dayId, rollCallId, userId, type, action });
		}
		if (action == "ABSENT") {
			try {
				await prisma.morningPresent.deleteMany({
					where: { userId, dayId },
				});
			} catch (error) {
				return socket.emit("error", "Error updating roll call");
			}
			socket.to(`room:morning-register-${dayId}`).emit("update:morning-register", { dayId, rollCallId, userId, type, action });
			socket.to(`room:committee-roll-calls-${dayId}`).emit("update:morning-register", { dayId, rollCallId, userId, type, action });
		}
	}
	if (type == "ROLLCALL") {
		const selectedRollCall = await prisma.rollCall.findUnique({
			where: { id: rollCallId },
		});
		if (!selectedRollCall) {
			socket.emit("error", "Roll Call not found");
			return;
		}
		if (action == "ABSENT") {
			let res;
			try {
				res = await prisma.rollCall.findFirst({
					where: { id: rollCallId },
					include: { day: true },
				});
				await prisma.committeeRollCall.deleteMany({
					where: { userId, rollCallId },
				});
			} catch (error) {
				return socket.emit("error", "Error updating roll call");
			}
			socket.to(`room:committee-roll-calls-${res.day.id}`).emit("update:committee-roll-call", { dayId, rollCallId, userId, type, action });
		}
		if (action == "PRESENT") {
			let res;
			try {
				res = await prisma.committeeRollCall.upsert({
					where: { userId_rollCallId: { userId, rollCallId } },
					update: { type: "PRESENT" },
					create: { userId, rollCallId, type: "PRESENT" },
					include: { rollCall: { select: { day: true } } },
				});
			} catch (error) {
				return socket.emit("error", "Error updating roll call");
			}
			socket.to(`room:committee-roll-calls-${res.rollCall.day.id}`).emit("update:committee-roll-call", { dayId, rollCallId, userId, type, action });
		}
		if (action == "PRESENTANDVOTING") {
			let res;
			try {
				res = await prisma.committeeRollCall.upsert({
					where: { userId_rollCallId: { userId, rollCallId } },
					update: { type: "PRESENTANDVOTING" },
					create: { userId, rollCallId, type: "PRESENTANDVOTING" },
					include: { rollCall: { select: { day: true } } },
				});
			} catch (error) {
				return socket.emit("error", "Error updating roll call");
			}
			socket.to(`room:committee-roll-calls-${res.rollCall.day.id}`).emit("update:committee-roll-call", { dayId, rollCallId, userId, type, action });
		}
	}
}
