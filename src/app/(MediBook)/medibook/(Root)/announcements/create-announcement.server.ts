"use server";

import { getServerSession } from "@/hooks/getServerSession";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@client";
import { s, authorize } from "@/src/lib/authorize";

export async function createAnnouncement(formData: FormData) {
	const unauthorized = {
		status: 403,
		description: "You are not authorized to complete this action",
	};

	const success = {
		status: 200,
		description: "Announcement created successfully",
	};

	const error = (e: any) => {
		return {
			status: 500,
			description: "An error occurred while creating the announcement",
			error: e,
		};
	};

	const missing = (field: string) => {
		return {
			status: 400,
			description: field,
		};
	};

	const userSession = await getServerSession(authOptions);
	if (!userSession || !authorize(userSession, [s.management])) return unauthorized;

	let data: any = {};
	let scope = formData.get("scope");
	data.title = formData.get("title");
	data.description = formData.get("description");
	data.markdown = formData.get("markdown");
	data.isEmail = /* formData.get("email"); */ false;
	data.isAnonymous = formData.get("isAnonymous");
	data.isSecretariat = formData.get("isSecretariat");
	data.isBoard = formData.get("isBoard");
	data.isMedibook = formData.get("isMedibook");
	data.isWebsite = formData.get("isWebsite");
	data.isPinned = formData.get("isPinned");
	data.isEdited = false;

	if (!scope) return missing("Please Select a Scope");
	if (!data.title) return missing("Please Enter a Title");
	if (!data.description) return missing("Please Enter a Description");
	if (!data.markdown) return missing("Please Enter a Message");

	data.isAnonymous = data.isAnonymous == "on" ? true : false;
	data.isSecretariat = data.isSecretariat == "on" ? true : false;
	data.isBoard = data.isBoard == "on" ? true : false;
	data.isMedibook = data.isMedibook == "on" ? true : false;
	data.isWebsite = data.isWebsite == "on" ? true : false;
	data.isPinned = data.isPinned == "on" ? true : false;

	//ADD EMAIL FUNCTIONALITY

	await prisma.$connect();
	let announcement: any;
	switch (scope) {
		case "global": //EVERYONE
			if (!authorize(userSession, [s.highsec, s.board])) return unauthorized;
			try {
				announcement = await prisma.announcement.create({
					data: { ...data, sender: { connect: { userNumber: userSession.user.userNumber } }, GlobalAnnouncement: { create: {} } },
				});
			} catch (e) {
				return error(e);
			}
			break;
		case "registered": //PEOPLE WITH AN ACCOUNT
			if (!authorize(userSession, [s.highsec, s.board])) return unauthorized;
			try {
				announcement = await prisma.announcement.create({
					data: { ...data, sender: { connect: { userNumber: userSession.user.userNumber } }, RegisteredAnnouncement: { create: {} } },
				});
			} catch (e) {
				return error(e);
			}
			break;
		case "alumni":
			if (!authorize(userSession, [s.board])) return unauthorized;
			try {
				announcement = await prisma.announcement.create({
					data: { ...data, sender: { connect: { userNumber: userSession.user.userNumber } }, AlumniAnnouncement: { create: {} } },
				});
			} catch (e) {
				return error(e);
			}
			break;
	}

	return success;
}
