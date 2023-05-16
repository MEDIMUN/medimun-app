"use server";

import { setTimeout as sleep } from "timers/promises";
import { getServerSession } from "@/hooks/getServerSession";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@client";
import { Scope, authorize } from "@/src/lib/authorize";

export async function createAnnouncement(formData: FormData) {
	const userSession = await getServerSession(authOptions);
	let data: any = {};
	data.title = formData.get("title");
	data.description = formData.get("description");
	data.markdown = formData.get("markdown");
	data.scope = formData.get("scope");
	data.email = formData.get("email");
	data.isAnonymous = formData.get("isAnonymous");
	data.isSecretariat = formData.get("isSecretariat");
	data.isBoard = formData.get("isBoard");
	data.isEmail = formData.get("isEmail");
	data.isMedibook = formData.get("isMedibook");
	data.isWebsite = formData.get("isWebsite");
	data.isPinned = formData.get("isPinned");

	if (
		!authorize(userSession, [Scope["Higher Organizer"]]) ||
		!(data.title || data.markdown || data.scope || data.email || data.description)
	) {
		return {
			status: 400,
			error: "invalid",
			description:
				"Please fill out all fields or ensure that you are allowed to complete the action",
		};
	}

	console.log("data");
	console.log(data);
	/* try {
		await prisma.$connect();
		await prisma.announcement.create({
			data: {
				title: title,
				description: description,
				markdown: markdown,
				isEdited: false,
				isAnonymous: isAnonymous,
				isSecretariat: isSecretariat,
				isBoard: isBoard,
				isEmail: isEmail,
				isMedibook: isMedibook,
				isWebsite: isWebsite,
				isPinned: isPinned,
				sender: {
					connect: {
						userNumber: userSession.userNumber,
					},
				},
				GlobalAnnouncement: {
					create: {},
				},
			},
		});
	} catch (error) {
		console.log(error);
		return {
			status: 500,
			error: "error",
			description: "Something went wrong",
		};
	} */

	await sleep(3000);
	return "error";
	/* 	redirect("/medibook/announcements");
	 */
}
