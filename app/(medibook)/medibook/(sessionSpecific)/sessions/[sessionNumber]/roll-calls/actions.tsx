"use server";

import { auth } from "@/auth";
import { verifyPassword } from "@/lib/password";
import { s, authorize } from "@/lib/authorize";
import { capitalize } from "@/lib/text";
import { parseFormData } from "@/lib/form";
import prisma from "@/prisma/client";
import { z } from "zod";

export async function createRollCall(formData) {
	const session = await auth();
	if (!session) return;
	if (!authorize(session, [s.management]))
		return { ok: false, title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
	const schema = z.object({
		id: z
			.string()
			.trim()
			.transform((v) => (!v ? null : v))
			.nullable(),
		dayId: z.string(),
		name: z
			.string()
			.max(100)
			.toUpperCase()
			.transform((v) => v.replace(/[^A-Z0-9 ]/g, "").trim())
			.transform(capitalize),
	});

	const { success, data } = schema.safeParse(parseFormData(formData));
	if (!success) return { ok: false, message: "Invalid data." };

	const { id, dayId, name } = data;

	if (id) {
		try {
			await prisma.rollCall.update({
				where: { id },
				data: { name },
			});
		} catch {
			return { ok: false, message: "Error updating roll call." };
		}
		return { ok: true, message: "Roll call updated." };
	}

	const day = await prisma.day.findUnique({
		where: { id: dayId },
		include: {
			RollCall: {
				orderBy: { index: "asc" },
			},
		},
	});

	if (!day) return { ok: false, message: "Day not found." };

	const index = day.RollCall.length;

	if (index >= 10) return { ok: false, message: "Maximum amount of roll calls reached." };

	try {
		await prisma.rollCall.create({
			data: {
				name,
				index,
				day: {
					connect: {
						id: dayId,
					},
				},
			},
		});
	} catch {
		return { ok: false, message: "Error creating roll call." };
	}
	return { ok: true, message: "Roll call created" };
}

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
	const session = await auth();
	if (!session) return;
	if (!authorize(session, [s.management]))
		return { ok: false, title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };

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

export async function deleteRollCall(formData: FormData) {
	const session = await auth();
	if (!session) return;
	if (!authorize(session, [s.management]))
		return { ok: false, title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };

	const id = formData.get("id");
	const password = formData.get("password").trim();
	if (!id) return { ok: false, message: "Invalid data." };

	//get user from session get account check password hash if matches
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: { account: true },
	});

	if (!user) return { ok: false, message: "User not found." };
	const hashedPassword = user.account.password;
	const match = await verifyPassword(password, hashedPassword);
	if (!match) return { ok: false, message: "Invalid password." };

	let rollCall;
	try {
		rollCall = await prisma.rollCall.findUnique({
			where: { id: id },
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
		return { ok: false, message: "Error deleting roll call." };
	}

	if (!rollCall) return { ok: false, message: "Roll call not found." };

	const { day } = rollCall;
	const rollCalls = day.RollCall;
	const index = rollCalls.findIndex((rc) => rc.id === id);
	try {
		await prisma.$transaction([
			prisma.rollCall.delete({
				where: { id: id },
			}),
			...rollCalls.slice(index + 1).map((rc) =>
				prisma.rollCall.update({
					where: { id: rc.id },
					data: { index: rc.index - 1 },
				})
			),
		]);
	} catch {
		return { ok: false, message: "Error deleting roll call." };
	}
	return { ok: true, message: "Roll call deleted." };
}
