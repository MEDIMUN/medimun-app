"use server";

import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeManagerDepartment, s } from "@/lib/authorize";
import { parseFormData } from "@/lib/form";
import { z } from "zod";
import { authorizedToEditAnnouncement } from "./default";
import prisma from "@/prisma/client";

export async function publishAnnouncement(formData: FormData, params) {
	const authSession = await auth();
	const schema = z.object({
		title: z.string().min(10).max(100),
		description: z.string().min(10).max(500).optional().nullable(),
		markdown: z.string().min(10).max(10000),
		privacy: z.string(),
		type: z.string(),
		scope: z.string(),
	});

	const parsedFormData = parseFormData(formData);
	const { data, error } = schema.safeParse(parsedFormData);
	if (error) {
		return { ok: false, error: "Invalid data submitted." };
	}

	const submittedScope = data.scope.split(",");
	const scopeMap = authorizedToEditAnnouncement(authSession, params.committeeId, params.departmentId);
	const arrayOfBooleanScope = submittedScope.map((scope) => scopeMap[scope]);
	if (arrayOfBooleanScope.includes(false)) return { ok: false, error: "You are not authorized to publish to the selected scope." };

	try {
		await prisma.announcement.create({
			data: {
				title: data.title,
				description: data.description,
				markdown: data.markdown,
				privacy: data.privacy,
				type: data.type.split(","),
				scope: data.scope.split(","),
				committeeId: params.committeeId,
				departmentId: params.departmentId,
				userId: authSession.user.id,
			},
		});
	} catch (e) {
		console.log(e);
		return { ok: false, message: "Failed to create announcement." };
	}

	return { ok: true, message: "Announcement created." };
}
