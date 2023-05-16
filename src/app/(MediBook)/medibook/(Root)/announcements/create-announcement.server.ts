"use server";

import { getServerSession } from "@/hooks/getServerSession";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@client";
import { s, authorize } from "@/src/lib/authorize";

export async function createAnnouncement(formData: FormData) {
	const userSession = await getServerSession(authOptions);
	let data: any = {};
	let scope = formData.get("scope");
	data.title = formData.get("title");
	data.description = formData.get("description");
	data.markdown = formData.get("markdown");
	data.isEmail = formData.get("email");
	data.isAnonymous = formData.get("isAnonymous");
	data.isSecretariat = formData.get("isSecretariat");
	data.isBoard = formData.get("isBoard");
	data.isEmail = formData.get("isEmail");
	data.isMedibook = formData.get("isMedibook");
	data.isWebsite = formData.get("isWebsite");
	data.isPinned = formData.get("isPinned");
	data.isEdited = false;

	const unauthorized = {
		status: 403,
		description: "You are not authorized to complete this action",
	};

	const success = {
		status: 200,
		description: "Announcement created successfully",
	};

	const error = (e: any) => {
		console.error(e);
		return {
			status: 500,
			description: "An error occurred while creating the announcement",
		};
	};

	if (
		!userSession ||
		!authorize(userSession, [s.management]) ||
		!(data.title || data.markdown || scope || data.email || data.description)
	) {
		return unauthorized;
	}

	data.isAnonymous = data.isAnonymous == "on" ? true : false;
	data.isSecretariat = data.isSecretariat == "on" ? true : false;
	data.isBoard = data.isBoard == "on" ? true : false;
	data.isEmail = data.isEmail == "on" ? true : false;
	data.isMedibook = data.isMedibook == "on" ? true : false;
	data.isWebsite = data.isWebsite == "on" ? true : false;
	data.isPinned = data.isPinned == "on" ? true : false;
	data.isEmail =
		data.isEmail == "true"
			? true
			: data.isEmail == "false"
			? false
			: data.isEmail == "consent"
			? true
			: false;

	await prisma.$connect();
	let announcement: any;
	switch (scope) {
		case "global": //EVERYONE
			if (!authorize(userSession, [s.highsec, s.board])) {
				return unauthorized;
			}
			try {
				announcement = await prisma.announcement.create({
					data: {
						...data,
						sender: {
							connect: {
								userNumber: userSession.user.userNumber,
							},
						},
						GlobalAnnouncement: {
							create: {},
						},
					},
				});
			} catch (e) {
				return error(e);
			}
			break;
		case "registered": //PEOPLE WITH AN ACCOUNT
			if (!authorize(userSession, [s.highsec, s.board])) {
				return unauthorized;
			}
			try {
				announcement = await prisma.announcement.create({
					data: {
						...data,
						sender: {
							connect: {
								userNumber: userSession.user.userNumber,
							},
						},
						RegisteredAnnouncement: {
							create: {},
						},
					},
				});
			} catch (e) {
				return error(e);
			}
			break;
		case "alumni":
			if (!authorize(userSession, [s.board])) {
				return unauthorized;
			}
			try {
				announcement = await prisma.announcement.create({
					data: {
						...data,
						sender: {
							connect: {
								userNumber: userSession.user.userNumber,
							},
						},
						AlumniAnnouncement: {
							create: {},
						},
					},
				});
			} catch (e) {
				return error(e);
			}
			break;
	}

	return success;
	//redirect("/medibook/announcements");
}
