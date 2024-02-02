"use server";

import "server-only";

import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";
import { v4 as uuidv4 } from "uuid";

export async function addDepartment(formData) {
	const session = await getServerSession(authOptions);
	const sessionNumber = formData.get("sessionNumber");
	const name = formData.get("name") || null;
	const description = formData.get("description") || null;
	const shortName = formData.get("shortName") || null;
	const type = formData.get("departmentType");
	const slug = formData.get("slug") || null;
	const departmentId = formData.get("departmentId") || null;

	if (!authorize(session, [s.management])) return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
	console.log(sessionNumber);
	try {
		await prisma.department.upsert({
			where: {
				id: departmentId || uuidv4(),
			},
			update: {
				name,
				description,
				shortName,
				slug,
				type,
			},
			create: {
				name,
				description,
				shortName,
				slug,
				type,
				session: {
					connect: {
						number: sessionNumber,
					},
				},
			},
		});
	} catch (e) {
		console.log(e);
		return { ok: false, title: "Error", description: "An error occurred while adding the department", variant: "destructive" };
	}
	return { ok: true, title: "Department added", description: "The department was successfully added", variant: "default" };
}

export async function deleteDepartment(departmentId) {
	const session = await getServerSession(authOptions);
	if (!authorize(session, [s.management])) return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };

	try {
		await prisma.department.delete({
			where: {
				id: departmentId,
			},
		});
	} catch (e) {
		if (e.code === "P2003") return { ok: false, title: "Error", description: "The department cannot be deleted because it has members or managers assigned to it", variant: "destructive" };
		return { ok: false, title: "Error", description: "An error occurred while deleting the department", variant: "destructive" };
	}
	return { ok: true, title: "Department deleted", description: "The department was successfully deleted", variant: "default" };
}
