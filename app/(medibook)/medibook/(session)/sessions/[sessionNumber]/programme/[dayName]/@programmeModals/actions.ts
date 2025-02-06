"use server";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { parseFormData } from "@/lib/parse-form-data";
import { entityCase } from "@/lib/text";
import prisma from "@/prisma/client";
import { z } from "zod";

const dayEventSchema = z
	.object({
		id: z.string().optional().nullable(),
		name: z.string().trim().max(50, "Name must be at most 50 characters long").toUpperCase(),
		description: z.string().trim().max(250, "Description must be at most 250 characters long").optional().nullable(),
		startTime: z.string().transform((value) => {
			const [hours, minutes] = value.split(":").map(Number);
			if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
				throw new Error("Invalid time format.");
			}
			return value;
		}),
		endTime: z.string().transform((value) => {
			const [hours, minutes] = value.split(":").map(Number);
			if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
				throw new Error("Invalid time format.");
			}
			return value;
		}),
		location: z.string().trim().max(50, "Location must be at most 50 characters long").optional().nullable(),
		dayId: z.string().optional().nullable(),
	})
	.refine((data) => data.startTime < data.endTime, {
		message: "Start time must be before end time.",
	})
	.refine((data) => data.startTime !== data.endTime, {
		message: "Start time must be different from end time.",
	})
	.refine((data) => data.id || data.dayId, { message: "Day ID is required." });

export async function createDayEvent(formData: FormData) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: ["Unauthorized."] };

	const parsedFormData = parseFormData(formData);
	const { error, data } = dayEventSchema.safeParse(parsedFormData);

	if (error || !data.dayId) return { ok: false, message: ["Invalid data."] };

	try {
		await prisma.dayEvent.create({
			data: {
				name: data.name,
				description: data.description,
				startTime: data.startTime,
				endTime: data.endTime,
				location: data.location,
				Day: { connect: { id: data.dayId } },
			},
		});
	} catch (e) {
		return { ok: false, message: ["Failed to create day event."] };
	}

	return { ok: true, message: ["Day event added."] };
}

export async function editDayEvent(formData: FormData) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: ["Unauthorized."] };

	const parsedFormData = parseFormData(formData);
	const { error, data } = dayEventSchema.safeParse(parsedFormData);

	if (error || !data.id) return { ok: false, message: ["Invalid data."] };

	try {
		await prisma.dayEvent.update({
			where: { id: data.id },
			data: {
				name: data.name,
				description: data.description,
				startTime: data.startTime,
				endTime: data.endTime,
			},
		});
	} catch (e) {
		return { ok: false, message: ["Failed to edit day event."] };
	}

	return { ok: true, message: ["Day event edited."] };
}

export async function deleteDayEvent(dayEventId: string) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: ["Unauthorized."] };

	try {
		await prisma.dayEvent.delete({ where: { id: dayEventId } });
	} catch (e) {
		return { ok: false, message: ["Failed to delete day event."] };
	}

	return { ok: true, message: ["Day event deleted."] };
}
