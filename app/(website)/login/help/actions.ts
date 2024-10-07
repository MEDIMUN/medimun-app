"use server";

import { sendEmailResetPassword } from "@/email/send";
import prisma from "@/prisma/client";

export async function resetPassword(formData: FormData) {
	let selectedUser;
	const username = formData.get("username").toString().toLowerCase().trim();
	if (username === "") return { ok: false, message: ["Username is required."] };
	try {
		await prisma.$transaction(async (tx) => {
			selectedUser = await tx.user.findFirstOrThrow({
				where: { OR: [{ username: username }, { email: username }, { id: username }] },
				select: { id: true, email: true, officialName: true },
			});
			await tx.resetPassword.deleteMany({ where: { userId: selectedUser.id } });
			const passwordResetRow = await tx.resetPassword.create({
				data: { userId: selectedUser.id },
			});
			const passwordResetCode = passwordResetRow.passwordResetCode;
			await sendEmailResetPassword({
				officialName: selectedUser.officialName,
				email: selectedUser.email,
				passwordResetLink: `https://www.medimun.org/login/help/${passwordResetCode}`,
			});
		});
	} catch (error) {
		return { ok: false, message: ["You will receive an email if the username exists."] };
	}
	return { ok: true, message: ["You will receive an email if the username exists."] };
}
