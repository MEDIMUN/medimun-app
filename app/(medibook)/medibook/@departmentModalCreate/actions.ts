"use server";

import prisma from "@/prisma/client";
import { s, authorize } from "@/lib/authorize";
import { auth } from "@/auth";
import { z } from "zod";
import { entityCase } from "@/lib/text";
import { parseFormData } from "@/lib/parse-form-data";

export async function addDepartment(formData, sessionNumber) {
	const authSession = await auth();

	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const schema = z.object({
		name: z.string().trim().min(3).max(100).transform(entityCase),
		shortName: z.string().trim().min(2).max(4).toUpperCase().optional().nullable(),
	});
	const parsedFormData = parseFormData(formData);
	const { data, error } = schema.safeParse(parsedFormData);

	if (error) return { ok: false, message: "Invalid data." };

	const selectedSession = await prisma.session.findUnique({ where: { number: sessionNumber } });

	const currentSession = await prisma.session.findFirst({ where: { isCurrent: true } });

	if (!selectedSession) return { ok: false, message: "Invalid session" };

	if (!authorize(authSession, [s.admins, s.sd]) && !selectedSession.isCurrent && selectedSession.numberInteger <= currentSession.numberInteger)
		return { ok: false, message: "Session is not current or in the future." };

	let newDepartment;

	try {
		newDepartment = await prisma.department.create({
			data: {
				name: data.name,
				shortName: data.shortName,
				session: { connect: { number: sessionNumber } },
			},
			select: { id: true },
		});
	} catch (error) {
		return { ok: false, message: "Failed to create department." };
	}

	return { ok: true, message: "Department created.", data: newDepartment.id };
}
