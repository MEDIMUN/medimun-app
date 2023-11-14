"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/prisma/client";
import { authorize, s } from "@/lib/authorize";
import { redirect } from "next/navigation";

export async function deleteAnnouncement ( announcementId ) {
	const session = await getServerSession( authOptions );
	if ( !session || session.isDisabled ) redirect( "/medibook/signout" );
	let announcement;
	try {
		announcement = await prisma.announcement.findUnique( {
			where: {
				id: announcementId,
			},
			select: {
				CommitteeAnnouncement: {
					select: {
						committee: {
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
		} );
	} catch ( e ) {
		return { ok: false, error: "An error occured while deleting the announcement.", title: "An error occured while deleting the announcement." };
	}
	let committeeId = announcement.CommitteeAnnouncement.committee.id;
	let sessionNumber = announcement.CommitteeAnnouncement.committee.session.number;

	if ( !( authorize( session, [ s.management ] ) || session.currentRoles.some( ( role ) => role.committeeId === committeeId ) ) )
		return { ok: false, error: "You are not authorized to delete announcements." };

	try {
		await prisma.announcement.delete( {
			where: {
				id: announcementId,
			},
		} );
	} catch ( e ) {
		return { ok: false, error: "An error occured while deleting the announcement." };
	}
	redirect( `/medibook/sessions/${ sessionNumber }/committees/${ committeeId }/announcements` );
}
