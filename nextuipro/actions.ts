"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";
import prisma from "@/prisma/client";

export async function getSessionData(number) {
	const session = await getServerSession(authOptions as any);
	if (!session) return;
	let selectedSession = null;
	try {
		selectedSession = await prisma.session.findFirst({
			where: {
				number: number,
			},
			include: {
				committee: {
					select: {
						id: true,
						name: true,
						slug: true,
						shortName: true,
					},
					orderBy: {
						name: "asc",
					},
				},
				department: {
					select: {
						id: true,
						name: true,
						slug: true,
						shortName: true,
					},
					orderBy: {
						name: "asc",
					},
				},
			},
		});
	} catch (e) {
		return;
	}
	return selectedSession;
}
