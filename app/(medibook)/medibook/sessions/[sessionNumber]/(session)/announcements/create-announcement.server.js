"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { v4 as uuidv4 } from "uuid";

export async function createSessionAnnouncement ( formData ) {
	const session = await getServerSession( authOptions );
	if ( !authorize( session, [ s.management ] ) ) {
		return { ok: false, title: "Unauthorized", description: "You are not authorized to create an announcement.", variant: "destructive" };
	}
	const title = formData.get( "title" );
	const description = formData.get( "description" ) || null;
	const markdown = formData.get( "markdown" );
	const editId = formData.get( "editId" );
	const privacy = formData.get( "privacy" );
	const selectedSession = formData.get( "selectedSession" );
	console.log( selectedSession );
	let sessionId;
	try {
		sessionId = await prisma.session.findUniqueOrThrow( {
			where: { number: selectedSession },
			select: { id: true },
		} );
	} catch ( e ) {
		return { ok: false, title: "Error", description: "Could not find session", variant: "destructive" };
	}
	console.log( sessionId );
	try {
		await prisma.sessionAnnouncement.upsert( {
			where: { id: editId || uuidv4() },
			update: { title, description, markdown, privacy, editTime: new Date() },
			create: {
				sessionId: sessionId.id,
				userId: session.user.id,
				title,
				description,
				markdown,
				editTime: new Date(),
				time: new Date(),
			},
		} );
	} catch ( e ) {
		console.log( e );
		return { ok: false, title: "Error", description: "Could not update or create announcement", variant: "destructive" };
	}
	return { ok: true, title: "Announcement updated", variant: "default" };
}

export async function deleteSessionAnnouncement ( id ) {
	const session = await getServerSession( authOptions );
	if ( !authorize( session, [ s.management ] ) ) {
		return { ok: false, title: "Unauthorized", description: "You are not authorized to delete an announcement.", variant: "destructive" };
	}
	try {
		await prisma.sessionAnnouncement.delete( { where: { id } } );
	} catch ( e ) {
		return { ok: false, title: "Error", description: "Could not delete announcement", variant: "destructive" };
	}
	return { ok: true, title: "Announcement deleted", variant: "default" };
}

export async function pinAnnouncement ( id ) {
	const session = await getServerSession( authOptions );
	if ( !authorize( session, [ s.management ] ) ) {
		return { ok: false, title: "Unauthorized", description: "You are not authorized to pin an announcement.", variant: "destructive" };
	}
	console.log( id );
	try {
		//toggle pin
		const announcement = await prisma.sessionAnnouncement.findUnique( { where: { id } } );
		await prisma.sessionAnnouncement.update( { where: { id }, data: { isPinned: !announcement.isPinned } } );
	} catch ( e ) {
		console.log( e );
		return { ok: false, title: "Error", description: "Could not pin announcement", variant: "destructive" };
	}
	return { ok: true, title: "Announcement pinned", variant: "default" };
}
