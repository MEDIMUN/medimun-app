"use server";

import prisma from "@/prisma/client";
import { s, authorize } from "@/lib/authorize";
import { auth } from "@/auth";
import { z } from "zod";
import { entityCase, processSlug } from "@/lib/text";
import { parseFormData } from "@/lib/form";
import { verifyPassword } from "@/lib/password";

export async function editCommittee(formData, committeeId) {
	const schema = z.object({
		name: z.string().trim().min(5).max(100).transform(entityCase),
		shortName: z.string().trim().toUpperCase().optional().nullable(),
		type: z.enum(["SECURITYCOUNCIL", "SPECIALCOMMITTEE", "GENERALASSEMBLY"]),
		isVisible: z.boolean(),
		slug: z.string().trim().optional().nullable().transform(processSlug),
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
		if (e.code === "P2002") return { ok: false, message: "Committee short name and slug must be unique." };
		return { ok: false, message: "An error occurred while updating the committee." };
	}

	return { ok: true, message: "Committee updated" };
}

export async function deleteCommittee(formData, committeeId) {
	const authSession = await auth();

	if (!authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const selectedCommittee = await prisma.committee.findUnique({ where: { id: committeeId }, include: { session: true } });

	if (!selectedCommittee.session.isCurrent && !authorize(authSession, [s.admins, s.sd])) return { ok: false, message: "Error" };

	const selectedUser = await prisma.user.findUnique({ where: { id: authSession.user.id }, include: { Account: true } });

	const password = formData.get("password");

	const isPasswordCorrect = await verifyPassword(password, selectedUser.Account[0].password);

	if (!isPasswordCorrect) return { ok: false, message: "Invalid password" };

	try {
		await prisma.committee.delete({ where: { id: committeeId } });
	} catch (e) {
		return { ok: false, message: "An error occurred while deleting the committee." };
	}
	return { ok: true, message: "Committee deleted" };
}

export async function addCommittee(formData: FormData, sessionNumber) {
	const authSession = await auth();

	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const schema = z.object({
		name: z
			.string()
			.trim()
			.min(5)
			.max(100)
			.transform((value) => entityCase(value.trim())),
		shortName: z.string().trim().min(2).max(4).toUpperCase(),
	});

	const parsedFormData = parseFormData(formData);

	const { data, error } = schema.safeParse(parsedFormData);

	if (error) return { ok: false, message: "Invalid data." };

	const selectedSession = await prisma.session.findUnique({ where: { number: sessionNumber } });

	const currentSession = await prisma.session.findFirst({ where: { isCurrent: true } });

	if (!selectedSession) return { ok: false, message: "Invalid session" };

	if (!authorize(authSession, [s.admins, s.sd]) && !selectedSession.isCurrent && selectedSession.numberInteger <= currentSession.numberInteger)
		return { ok: false, message: "Session is not current or in the future." };

	let newCommittee;

	try {
		newCommittee = await prisma.committee.create({
			data: {
				name: data.name,
				shortName: data.shortName,
				session: { connect: { number: sessionNumber } },
			},
			select: { id: true },
		});
	} catch (error) {
		return { ok: false, message: "Failed to create committee" };
	}

	return { ok: true, message: "Committee created", data: newCommittee.id };
}
