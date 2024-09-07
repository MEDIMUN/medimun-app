"use server";

import { signIn as signInAction } from "@/auth";

export async function signIn(formData: FormData) {
	try {
		await signInAction("credentials", {
			username: formData.get("username"),
			password: formData.get("password"),
		});
	} catch (error) {
		return { ok: false, message: error.code };
	}
	return { ok: true, message: "Signed in." };
}
