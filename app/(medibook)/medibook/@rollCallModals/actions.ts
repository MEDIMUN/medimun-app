"use server";

import { auth } from "@/auth";
import { s, authorize } from "@/lib/authorize";
import { capitalize } from "@/lib/text";
import { parseFormData } from "@/lib/parse-form-data";
import prisma from "@/prisma/client";
import { z } from "zod";

export async function createRollCall(formData, dayId) {
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: ["Unauthorized."] };
	const schema = z.object({
		name: z
			.string()
			.max(20)
			.toUpperCase()
			.transform((v) => v.replace(/[^A-Z0-9 ]/g, "").trim())
			.transform(capitalize)
			.optional()
			.nullable(),
	});

	const selectedDay = await prisma.day.findUnique({
		where: { id: dayId },
		include: { RollCall: { orderBy: { index: "asc" } } },
	});

	if (!selectedDay) return { ok: false, message: ["Day not found."] };

	const { error, data } = schema.safeParse(parseFormData(formData));

	if (error) return { ok: false, message: ["Invalid data."] };

	const index = selectedDay.RollCall.length;

	if (index >= 10) return { ok: false, message: ["Maximum amount of roll calls reached."] };

	try {
		await prisma.rollCall.create({
			data: {
				name: data.name,
				index,
				dayId: selectedDay.id,
			},
		});
	} catch {
		return { ok: false, message: ["Error creating roll call."] };
	}
	return { ok: true, message: ["Roll call created"] };
}

export async function editRollCall(formData, rollCallId) {
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: ["Unauthorized."] };
	const schema = z.object({
		name: z
			.string()
			.max(20)
			.toUpperCase()
			.transform((v) => v.replace(/[^A-Z0-9 ]/g, "").trim())
			.transform(capitalize),
	});

	const { error, data } = schema.safeParse(parseFormData(formData));

	if (error) return { ok: false, message: ["Invalid data."] };

	try {
		await prisma.rollCall.update({
			where: { id: rollCallId },
			data: { name: data.name },
		});
	} catch {
		return { ok: false, message: ["Error creating roll call."] };
	}
	return { ok: true, message: ["Roll call created"] };
}

export async function deleteRollCall(rollCallId: string) {
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: ["Unauthorized."] };

	let rollCall;
	try {
		rollCall = await prisma.rollCall.findUniqueOrThrow({
			where: { id: rollCallId },
			include: { day: { include: { RollCall: { orderBy: { index: "asc" } } } } },
		});
	} catch {
		return { ok: false, message: ["Error deleting roll call."] };
	}

	const { day } = rollCall;
	const rollCalls = day.RollCall;
	const index = rollCalls.findIndex((rc) => rc.id === rollCallId);
	try {
		await prisma.$transaction([
			prisma.rollCall.delete({
				where: { id: rollCallId },
			}),
			...rollCalls.slice(index + 1).map((rc) =>
				prisma.rollCall.update({
					where: { id: rc.id },
					data: { index: rc.index - 1 },
				})
			),
		]);
	} catch {
		return { ok: false, message: ["Error deleting roll call."] };
	}
	return { ok: true, message: ["Roll call deleted."] };
}
