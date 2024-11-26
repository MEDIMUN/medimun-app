"use server";

import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeManagerDepartment, s } from "@/lib/authorize";
import { parseFormData } from "@/lib/parse-form-data";
import { z } from "zod";
import { authorizedToEditAnnouncementMap, typeGreaterScopeMapList } from "./default";
import prisma from "@/prisma/client";
import { isPinned } from "@mantine/hooks/lib/use-headroom/use-headroom";
import { AnnouncementPrivacyTypes } from "@prisma/client";
import { processSlug } from "@/lib/text";
import { unstable_after as after } from "next/server";
import { sendEmailAnnouncement } from "@/email/send";

export async function publishAnnouncement(formData: FormData, params) {
	const authSession = await auth();
	const schema = z.object({
		title: z.string().min(3).max(200),
		markdown: z.string().min(5).max(10000),
		privacy: z.enum(["NORMAL", "BOARD", "ANONYMOUS", "SECRETARIAT"]),
		type: z
			.string()
			.transform((val) => val.split(","))
			.pipe(
				z.array(z.enum(["WEBSITE", "EMAIL"])).refine((val) => val.includes("WEBSITE") && (val.includes("EMAIL") || val.length === 1), {
					message: "Invalid type selected. Must include 'WEBSITE', and only 'EMAIL' is optional.",
				})
			),
		slug: z
			.string()
			.transform((val) => processSlug(val.trim()))
			.optional()
			.nullable(),
		scope: z.string(),
		isPinned: z.boolean(),
		scopeType: z.enum(["globalAnnouncement", "sessionAnnouncement", "committeeAnnouncement", "departmentAnnouncement"]),
	});

	const typeEmailTitleMap = {
		globalAnnouncement: "You have received a new global announcement",
		sessionAnnouncement: "You have received a new session announcement",
		committeeAnnouncement: "You have received a new committee announcement",
		departmentAnnouncement: "You have received a new department announcement",
	};

	const parsedFormData = parseFormData(formData);
	const { data, error } = schema.safeParse(parsedFormData);
	if (error) return { ok: false, message: "Invalid data submitted." };
	let emails = [] as { email: string; name: string }[];

	let selectedCommittee = null,
		selectedDepartment = null,
		selectedSession = null;

	if (params.committeeId) {
		selectedCommittee = await prisma.committee.findFirst({
			where: {
				OR: [
					{ id: params.committeeId, session: { number: params.sessionNumber } },
					{ slug: params.committeeId, session: { number: params.sessionNumber } },
				],
			},
			include: { session: true },
		});
		const isEmail = data.scope.split(",").includes("COMMITTEEDELEGATE") && data.type.includes("EMAIL");
		if (isEmail) {
			const committee = await prisma.committee.findFirst({
				where: {
					id: selectedCommittee.id,
				},
				select: { delegate: { select: { user: { select: { email: true, officialName: true, officialSurname: true, displayName: true } } } } },
			});
			if (committee) {
				const emailList = committee.delegate.map((delegate) => {
					const name = delegate.user.displayName || `${delegate.user.officialName} ${delegate.user.officialSurname}`;
					return {
						email: delegate.user.email,
						name,
					};
				});
				emails = emails.concat(emailList);
			}
		}
	}

	if (params.departmentId) {
		selectedDepartment = await prisma.department.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.departmentId, session: { number: params.sessionNumber } },
					{ slug: params.departmentId, session: { number: params.sessionNumber } },
				],
			},
			include: { session: true },
		});

		const isEmail = data.scope.split(",").includes("DEPARTMENTMEMBER") && data.type.includes("EMAIL");

		if (isEmail) {
			const department = await prisma.department.findFirst({
				where: {
					id: selectedDepartment.id,
				},
				select: { member: { select: { user: { select: { email: true, officialName: true, officialSurname: true, displayName: true } } } } },
			});
			if (department) {
				const emailList = department.member.map((member) => {
					const name = member.user.displayName || `${member.user.officialName} ${member.user.officialSurname}`;
					return {
						email: member.user.email,
						name,
					};
				});
				emails = emails.concat(emailList);
			}
		}
	}

	const submittedScope = data.scope.split(",");
	const scopeMap = authorizedToEditAnnouncementMap(authSession, selectedCommittee?.id, selectedDepartment?.id);
	const arrayOfBooleanScope = submittedScope.map((scope) => scopeMap[scope]);
	if (arrayOfBooleanScope.includes(false)) return { ok: false, message: "You are not authorized to publish to the selected scope." };

	if (params.sessionNumber && !params.committeeId && !params.departmentId)
		try {
			selectedSession = await prisma.session.findFirstOrThrow({
				where: {
					number: params.sessionNumber,
				},
			});
		} catch (e) {
			return { ok: false, message: "Session not found." };
		}

	try {
		const timeNow = new Date();
		await prisma.announcement.create({
			data: {
				time: timeNow,
				editTime: timeNow,
				title: data.title,
				markdown: data.markdown,
				privacy: data.privacy,
				type: data.type,
				slug: data.slug,
				scope: data.scope.split(",") as AnnouncementPrivacyTypes[],
				committeeId: selectedCommittee?.id || null,
				departmentId: selectedDepartment?.id || null,
				sessionId: selectedSession?.id || null,
				userId: authSession.user.id,
				isPinned: data.isPinned,
			},
		});
	} catch (e) {
		console.log(e);
		return { ok: false, message: "Failed to create announcement." };
	}

	if (!!emails.length) {
		after(async () => {
			const emailPromises = emails.map(async (email) => {
				return sendEmailAnnouncement({
					name: email?.name,
					email: email?.email,
					markdown: data.markdown,
					announcementTitle: data.title,
					title: typeEmailTitleMap[data.scopeType],
				}).catch(() => {});
			});

			await Promise.all(emailPromises);

			io
				?.to(`private-user-${authSession?.user.id}`)
				.emit(
					"toast.info",
					`The announcement has been sent to ${emails.length} users via email. If our email queue is full, it may take a few minutes for the emails to be received.`
				);
		});
	}

	return { ok: true, message: "Announcement created." };
}

export async function editAnnouncement(formData: FormData, selectedAnnouncementId) {
	const authSession = await auth();

	const selectedAnnouncement = await prisma.announcement.findUnique({
		where: {
			id: selectedAnnouncementId,
		},
		include: {
			user: true,
			session: true,
			department: { include: { session: true } },
			committee: { include: { session: true } },
		},
	});

	const schema = z.object({
		title: z.string().min(3).max(100),
		markdown: z.string().min(5).max(10000),
		privacy: z.enum(["NORMAL", "BOARD", "ANONYMOUS", "SECRETARIAT"]),
		isPinned: z.boolean(),
		slug: z
			.string()
			.transform((val) => processSlug(val.trim()))
			.optional()
			.nullable(),
	});

	const parsedFormData = parseFormData(formData);
	const { data, error } = schema.safeParse(parsedFormData);
	if (error) {
		return { ok: false, message: "Invalid data submitted." };
	}

	const submittedScope = selectedAnnouncement.scope;
	const scopeMap = authorizedToEditAnnouncementMap(authSession, selectedAnnouncement.committeeId, selectedAnnouncement.departmentId);
	const arrayOfBooleanScope = submittedScope.map((scope) => scopeMap[scope]);
	if (arrayOfBooleanScope.includes(false)) return { ok: false, error: "You are not authorized to edit the announcement." };

	try {
		await prisma.announcement.update({
			where: {
				id: selectedAnnouncementId,
			},
			data: {
				title: data.title,
				markdown: data.markdown,
				privacy: data.privacy,
				isPinned: data.isPinned,
				slug: data.slug,
				editTime: new Date(),
			},
		});
	} catch (e) {
		return { ok: false, message: "Failed to create announcement." };
	}

	return { ok: true, message: "Announcement updated." };
}

export async function deleteAnnouncementAction(selectedAnnouncementId) {
	const authSession = await auth();

	const selectedAnnouncement = await prisma.announcement.findUnique({
		where: {
			id: selectedAnnouncementId,
		},
		include: {
			user: true,
			session: true,
			department: { include: { session: true } },
			committee: { include: { session: true } },
		},
	});

	const submittedScope = selectedAnnouncement.scope;
	const scopeMap = authorizedToEditAnnouncementMap(authSession, selectedAnnouncement.committeeId, selectedAnnouncement.departmentId);
	const arrayOfBooleanScope = submittedScope.map((scope) => scopeMap[scope]);
	if (arrayOfBooleanScope.includes(false)) return { ok: false, error: "You are not authorized to delete the announcement." };

	try {
		await prisma.announcement.delete({
			where: {
				id: selectedAnnouncementId,
			},
		});
	} catch (e) {
		return { ok: false, message: "Failed to delete announcement." };
	}

	return { ok: true, message: "Announcement deleted." };
}
