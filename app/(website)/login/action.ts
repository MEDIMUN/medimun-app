"use server";

import { signIn as signInAction } from "@/auth";
import prisma from "@/prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect";

export async function signIn(formData: FormData) {
	let selectedUser;
	const username = formData.get("username").toString().toLowerCase().trim();
	try {
		selectedUser = await prisma.user.findFirstOrThrow({
			where: { OR: [{ username: username }, { email: username }, { id: username }] },
			select: {
				lastLogin: true,
			},
		});
		await signInAction("credentials", {
			username: username,
			password: formData.get("password"),
		});
	} catch (error) {
		if (isRedirectError(error)) {
			return { ok: true, message: "Signed in.", firstLogin: selectedUser.lastLogin === null };
		}
		return { ok: false, message: error.code };
	}
	return { ok: true, message: "Signed in.", firstLogin: selectedUser.lastLogin === null };
}
