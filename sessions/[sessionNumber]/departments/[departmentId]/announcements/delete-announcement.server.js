"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/prisma/client";
import { authorize, s } from "@/lib/authorize";
import { redirect } from "next/navigation";

export async function deleteAnnouncement(announcementId) {
	const session = await getServerSession(authOptions);
	if (!session || session.isDisabled) redirect("/medibook/signout");
	let announcement;
	try {
		announcement = await prisma.announcement.findUnique({
			where: {
				id: announcementId,
			},
			select: {
				DepartmentAnnouncement: {
					select: {
						department: {
							select: {
								id: true,
								slug: true,
								session: {
									select: {
										number: true,
									},
								},
							},
						},
					},
				},
			},
		});
	} catch (e) {
		return { ok: false, error: "An error occured while deleting the announcement.", title: "An error occured while deleting the announcement." };
	}
	let departmentId = announcement.DepartmentAnnouncement.department.id;
	let sessionNumber = announcement.DepartmentAnnouncement.department.session.number;

	if (!(authorize(session, [s.management]) || session.currentRoles.some((role) => role.departmentId === departmentId)))
		return { ok: false, error: "You are not authorized to delete announcements." };

	try {
		await prisma.announcement.delete({
			where: {
				id: announcementId,
			},
		});
	} catch (e) {
		return { ok: false, error: "An error occured while deleting the announcement." };
	}
	redirect(`/medibook/sessions/${sessionNumber}/departments/${departmentId}/announcements`);
}
