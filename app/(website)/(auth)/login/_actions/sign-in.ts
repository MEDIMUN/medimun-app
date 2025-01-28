"use server";

import { signIn as signInAction } from "@/auth";
import prisma from "@/prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function signIn({ username, password }) {
	let selectedUser;
	try {
		selectedUser = await prisma.user.findFirstOrThrow({
			where: { OR: [{ username: username }, { email: username }, { id: username }] },
			select: {
				lastLogin: true,
			},
		});
		await signInAction("credentials", {
			username: username,
			password: password,
		});
	} catch (error) {
		if (isRedirectError(error)) {
			return { ok: true, message: "Signed in.", firstLogin: selectedUser.lastLogin === null };
		}
		return { ok: false, message: "User not found." };
	}
	return { ok: true, message: "Signed in.", firstLogin: selectedUser.lastLogin === null };
}
