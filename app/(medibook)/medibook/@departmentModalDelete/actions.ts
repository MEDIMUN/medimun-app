"use server";

import prisma from "@/prisma/client";
import { s, authorize } from "@/lib/authorize";
import { auth } from "@/auth";
import { parseFormData } from "@/lib/parse-form-data";
import { verifyPassword } from "@/lib/password-hash";

export async function deleteDepartment(formData: FormData, departmentId) {
	const authSession = await auth();

	const { password } = parseFormData(formData);

	if (!authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const selectedDepartment = await prisma.department.findUnique({ where: { id: departmentId }, include: { session: true } });

	if (!selectedDepartment.session.isCurrent && !authorize(authSession, [s.admins, s.sd])) return { ok: false, message: "Error" };

	const selectedUser = await prisma.user.findUnique({ where: { id: authSession.user.id }, include: { Account: true }, omit: { signature: true } });

	const isPasswordCorrect = await verifyPassword(password, selectedUser.Account[0].password);

	if (!isPasswordCorrect) return { ok: false, message: "Invalid password" };

	try {
		await prisma.department.delete({ where: { id: departmentId } });
	} catch (e) {
		return { ok: false, message: "An error occurred while deleting the department." };
	}
	return { ok: true, message: "Department deleted" };
}
