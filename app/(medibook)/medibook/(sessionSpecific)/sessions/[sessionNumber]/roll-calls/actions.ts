"use server";

import { auth } from "@/auth";
import { s, authorize } from "@/lib/authorize";
import prisma from "@/prisma/client";

export async function moveRollCallUp(rcId: string) {
	const session = await auth();
	if (!session) return;
	if (!authorize(session, [s.management]))
		return { ok: false, title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
	let rollCall;

	try {
		rollCall = await prisma.rollCall.findUnique({
			where: { id: rcId },
			include: {
				day: { include: { RollCall: { orderBy: { index: "asc" } } } },
			},
		});
	} catch {
		return { ok: false, message: "Error moving roll call." };
	}

	if (!rollCall) return { ok: false, message: "Roll call not found." };

	const { day } = rollCall;
	const rollCalls = day.RollCall;
	const index = rollCalls.findIndex((rc) => rc.id === rcId);

	if (index === 0) return { ok: false, message: "Already at top." };

	const rollCallAbove = rollCalls[index - 1];

	try {
		await prisma.$transaction([
			prisma.rollCall.update({
				where: { id: rcId },
				data: { index: rollCallAbove.index },
			}),
			prisma.rollCall.update({
				where: { id: rollCallAbove.id },
				data: { index },
			}),
		]);
	} catch {
		return { ok: false, message: "Error moving roll call." };
	}

	return { ok: true, message: "Roll call moved up." };
}

export async function moveRollCallDown(rcId: string) {
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: ["Unauthorized."] };

	let rollCall;
	try {
		rollCall = await prisma.rollCall.findUnique({
			where: { id: rcId },
			include: {
				day: {
					include: {
						RollCall: {
							orderBy: { index: "asc" },
						},
					},
				},
			},
		});
	} catch {
		return { ok: false, message: "Error moving roll call." };
	}

	if (!rollCall) return { ok: false, message: "Roll call not found." };

	const { day } = rollCall;
	const rollCalls = day.RollCall;
	const index = rollCalls.findIndex((rc) => rc.id === rcId);

	if (index === rollCalls.length - 1) return { ok: false, message: "Already at bottom." };

	const rollCallBelow = rollCalls[index + 1];

	try {
		await prisma.$transaction([
			prisma.rollCall.update({
				where: { id: rcId },
				data: { index: rollCallBelow.index },
			}),
			prisma.rollCall.update({
				where: { id: rollCallBelow.id },
				data: { index },
			}),
		]);
	} catch {
		return { ok: false, message: "Error moving roll call." };
	}

	return { ok: true, message: "Roll call moved down." };
}
