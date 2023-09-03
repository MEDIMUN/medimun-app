"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@client";
import { s, authorize } from "@/lib/authorize";

export async function createAnnouncement ( formData ) {
	const session = await getServerSession( authOptions );
	if ( !session ) return { ok: false, error: "Not logged in", title: "You are not logged in", variant: "destructive" };
	if ( !authorize( session, [ s.management ] ) ) return { ok: false, error: "Unauthorized", title: "You are not authorized to create announcements", variant: "destructive" };
	let announcement = {};
	announcement.title = formData.get( "title" );
	announcement.description = formData.get( "description" );
	announcement.markdown = formData.get( "markdown" );
	announcement.isAnonymous = formData.get( "isAnonymous" ) == "on";
	announcement.isBoard = formData.get( "isBoard" ) == "on";
	announcement.isSecretariat = formData.get( "isSecretariat" ) == "on";
	let isAlumni = formData.get( "isAlumni" ) == "on";
	let scope = formData.get( "scope" );
	if ( !announcement.title || !announcement.description || !announcement.markdown || !scope ) return { ok: false, error: "Missing fields", title: "Please fill in all required fields", variant: "destructive" };


	function error ( e ) {
		return { ok: false, error: "Error", title: "An error occurred while creating the announcement", variant: "destructive" };
	}

	switch ( scope ) {
		case "isBoth":
			await prisma.announcement.create( {
				data: {
					...announcement,
					user: {
						connect: {
							userNumber: session.user.userNumber
						},
					},
					WebsiteAnnouncement: {
						create: {}
					},
					MediBookAnnouncement: {
						create: {}
					}
				},
			} ).catch( e => error( e ) );
		case "isWebsite":
			await prisma.announcement.create( {
				data: {
					...announcement,
					user: {
						connect: {
							userNumber: session.user.userNumber
						},
					},
					WebsiteAnnouncement: {
						create: {}
					},
				},
			} ).catch( e => error( e ) );
		case "isMedibook":
			await prisma.announcement.create( {
				data: {
					...announcement,
					user: {
						connect: {
							userNumber: session.user.userNumber
						},
					},
					MediBookAnnouncement: {
						create: {}
					},
				},
			} ).catch( e => error( e ) );
	}
	return { ok: true, error: "Error", title: "Announcement created successfully", variant: "default" };
}
