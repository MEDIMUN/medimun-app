"use server";

import "server-only";

import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";
import { v4 as uuidv4 } from "uuid";

export async function addCommittee(formData) {
	const session = await getServerSession(authOptions);
	const sessionNumber = formData.get("sessionNumber");
	const name = formData.get("name") || null;
	const description = formData.get("description") || null;
	const shortName = formData.get("shortName") || null;
	const type = formData.get("committeeType");
	const slug = formData.get("slug") || null;
	const topic1 = formData.get("topic1") || null;
	const topic2 = formData.get("topic2") || null;
	const topic3 = formData.get("topic3") || null;
	const committeeId = formData.get("committeeId") || null;

	if (!authorize(session, [s.management])) return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
	try {
		await prisma.committee.upsert({
			where: {
				id: committeeId || uuidv4(),
			},
			update: {
				name,
				description,
				shortName,
				slug,
				type,
				topic1,
				topic2,
				topic3,
			},
			create: {
				name,
				description,
				shortName,
				slug,
				type,
				topic1,
				topic2,
				topic3,
				session: {
					connect: {
						number: sessionNumber,
					},
				},
			},
		});
	} catch (e) {
		console.log(e);
		return { ok: false, title: "Error", description: "An error occurred while adding the committee", variant: "destructive" };
	}
	return { ok: true, title: "Committee added", description: "The committee was successfully added", variant: "default" };
}

export async function deleteCommittee(committeeId) {
	const session = await getServerSession(authOptions);
	if (!authorize(session, [s.management])) return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };

	try {
		await prisma.committee.delete({
			where: {
				id: committeeId,
			},
		});
	} catch (e) {
		if (e.code === "P2003") return { ok: false, title: "Error", description: "The committee cannot be deleted because it has delegates or chairs assigned to it", variant: "destructive" };
		return { ok: false, title: "Error", description: "An error occurred while deleting the committee", variant: "destructive" };
	}
	return { ok: true, title: "Committee deleted", description: "The committee was successfully deleted", variant: "default" };
}
