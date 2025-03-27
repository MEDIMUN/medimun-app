"use server";

import { auth } from "@/auth";
import { authorize, authorizeDirect, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { getSocketInstance } from "@/socket/server";

export async function changeRegMorning(userId) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const isManagement = authorize(authSession, [s.management]);
	const isManager = authorizeDirect(authSession, [s.manager]);
	const isDelegate = authorizeDirect(authSession, [s.delegate]);
	const isMember = authorizeDirect(authSession, [s.member]);
	const allowedMemberDepartmentTypes = ["PI", "IT", "ADMIN"];
	const isMemberOfPIorIT =
		isMember && authSession?.user.currentRoles.filter((role) => role.roleIdentifier == "member").filter((role) => role?.departmentTypes?.some((type) => allowedMemberDepartmentTypes?.includes(type))).length > 0;

	if (!isManagement && !isManager && !isDelegate && !isMember) return { ok: false, message: ["Unauthorized"] };
	const socket = getSocketInstance();

	const cyprusMidnightString = new Date().toISOString().split("T")[0].concat("T00:00:00.000Z");
	const today = new Date(cyprusMidnightString);

	const selectedDay = await prisma.day.findFirst({ where: { date: today } });

	if (!selectedDay) return { ok: false, message: ["No day found"] };

	const selectedUser = await prisma.user.findFirst({
		where: { id: userId },
		omit: { signature: true },
		include: {
			MorningPresent: {
				where: {
					dayId: selectedDay.id,
				},
			},
		},
	});

	if (!selectedUser) return { ok: false, message: ["No user found"] };

	if (selectedUser.MorningPresent.length === 0) {
		try {
			await prisma.morningPresent.upsert({
				where: {
					userId_dayId: {
						userId,
						dayId: selectedDay.id,
					},
				},
				update: {},
				create: {
					userId,
					dayId: selectedDay.id,
				},
			});
		} catch (e) {
			return { ok: false, message: ["Error creating morning present"] };
		}
		if (socket) socket.to(`private-user-${selectedUser.id}`).emit("toast.success", "You have been registered for today.");
		return { ok: true, message: ["User registered for today"] };
	}

	if (selectedUser.MorningPresent.length !== 0) {
		try {
			await prisma.morningPresent.delete({
				where: {
					userId_dayId: {
						userId,
						dayId: selectedDay.id,
					},
				},
			});
		} catch (e) {
			return { ok: false, message: ["Error deleting morning present"] };
		}
		if (socket) socket.to(`private-user-${selectedUser.id}`).emit("toast.success", "You have been unregistered for today.");
		return { ok: true, message: ["User unregistered for today"] };
	}
}
