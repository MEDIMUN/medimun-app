"use server";

import prisma from "@/prisma/client";
import "server-only";

function sixtyFourDigitAlphanumericCode() {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let code = "";
	for (let i = 0; i < 64; i++) {
		code += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return code;
}

export async function resetPassword(formData) {
	const email = formData.get("email");
	prisma.passwordReset.create({
		data: {
			email,
			passwordResetCode: sixtyFourDigitAlphanumericCode(),
		},
	});
	return {
		ok: true,
		message: `A password reset link has been sent to ${email}.`,
	};
}
