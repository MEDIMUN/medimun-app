"use server";

import prisma from "@/prisma/client";
import { s, authorize } from "@/lib/authorize";
import { auth } from "@/auth";
import { z } from "zod";
import { entityCase, processSlug } from "@/lib/text";
import { parseFormData } from "@/lib/parse-form-data";
import { verifyPassword } from "@/lib/password-hash";

export async function editCommittee(formData, committeeId) {
	const schema = z.object({
		name: z.string().trim().transform(entityCase),
		description: z.string().trim().optional().nullable(),
		shortName: z.string().trim().toUpperCase().optional().nullable(),
		type: z.enum(["SECURITYCOUNCIL", "SPECIALCOMMITTEE", "GENERALASSEMBLY"]),
		isVisible: z.boolean(),
		slug: z.string().optional().nullable().transform(processSlug),
	});

	const authSession = await auth();

	if (!authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const parsedFormData = parseFormData(formData);

	const selectedCommittee = await prisma.committee.findUnique({ where: { id: committeeId } });

	if (!selectedCommittee) return { ok: false, message: "Committee not found" };

	const { data, error } = schema.safeParse(parsedFormData);

	if (error) return { ok: false, message: "Invalid data" };

	try {
		await prisma.committee.update({
			where: {
				id: committeeId,
			},
			data: data,
		});
	} catch (e) {
		return { ok: false, message: "An error occurred while updating the committee." };
	}

	return { ok: true, message: "Committee updated" };
}
