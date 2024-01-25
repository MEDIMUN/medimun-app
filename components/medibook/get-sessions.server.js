"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";

export async function getAllSessions() {
	const session = await getServerSession(authOptions);
	if (!session) notFound();
	return await prisma.session
		.findMany({
			orderBy: {
				number: "desc",
			},
		})
		.catch((e) => {
			return notFound();
		});
}
