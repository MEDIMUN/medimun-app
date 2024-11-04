"use server";

import { sendEmailPasswordChangedNotification, sendEmailResetPassword } from "@/email/send";
import { hashPassword } from "@/lib/password-hash";
import prisma from "@/prisma/client";

export async function resetPasswordFinal(formData: FormData) {
	const passwordFromForm = formData.get("password").toString().trim();
	const passwordResetCodeFromForm = formData.get("passwordResetCode").toString().trim();

	if (passwordFromForm === "") return { ok: false, message: ["Username is required."] };
	if (passwordResetCodeFromForm === "") return { ok: false, message: ["Password reset code is required."] };

	const isPasswordAtLeast8Characters = passwordFromForm.length >= 8;
	const isPasswordContainUppercase = /[A-Z]/.test(passwordFromForm);
	const isPasswordContainLowercase = /[a-z]/.test(passwordFromForm);
	const isPasswordContainNumber = /[0-9]/.test(passwordFromForm);
	const isPasswordContainSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(passwordFromForm);
	const isPasswordValid =
		isPasswordAtLeast8Characters &&
		isPasswordContainUppercase &&
		isPasswordContainLowercase &&
		isPasswordContainNumber &&
		isPasswordContainSpecialCharacter;

	if (!isPasswordValid) {
		return {
			ok: false,
			message: [
				"Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
			],
		};
	}

	try {
		await prisma.$transaction(async (tx) => {
			const selectedUser = await tx.user.findFirstOrThrow({
				where: {
					ResetPassword: {
						some: {
							passwordResetCode: passwordResetCodeFromForm,
						},
					},
				},
			});
			const hashedPassword = await hashPassword(passwordFromForm);
			await tx.account.updateMany({
				where: { userId: selectedUser.id },
				data: {
					password: hashedPassword,
				},
			});
			await tx.resetPassword.deleteMany({ where: { userId: selectedUser.id } });
			await sendEmailPasswordChangedNotification({
				officialName: selectedUser.officialName,
				email: selectedUser.email,
			});
		});
	} catch (error) {
		console.error(error);
		return { ok: false, message: ["Password reset code is invalid."] };
	}
	return { ok: true, message: ["Password changed successfully."] };
}
