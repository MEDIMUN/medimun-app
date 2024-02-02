"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { v4 as uuidv4 } from "uuid";

export async function createGlobalAnnouncement ( formData ) {
	const session = await getServerSession( authOptions );
	if ( !authorize( session, [ s.management ] ) ) {
		return { ok: false, title: "Unauthorized", description: "You are not authorized to create a notice.", variant: "destructive" };
	}
	const title = formData.get( "title" );
	const description = formData.get( "description" ) || null;
	const markdown = formData.get( "markdown" );
	const editId = formData.get( "editId" );
	const privacy = formData.get( "privacy" );
	try {
		await prisma.globalAnnouncement.upsert( {
			where: { id: editId || uuidv4() },
			update: { title, description, markdown, privacy, editTime: new Date() },
			create: {
				userId: session.user.id,
				title,
				description,
				markdown,
				editTime: new Date(),
				time: new Date(),
			},
		} );
	} catch ( e ) {
		return { ok: false, title: "Error", description: "Could not update or create notice", variant: "destructive" };
	}
	return { ok: true, title: "Notice updated", variant: "default" };
}

export async function deleteGlobalAnnouncement ( id ) {
	const session = await getServerSession( authOptions );
	if ( !authorize( session, [ s.management ] ) ) {
		return { ok: false, title: "Unauthorized", description: "You are not authorized to delete a notice.", variant: "destructive" };
	}
	try {
		await prisma.globalAnnouncement.delete( { where: { id } } );
	} catch ( e ) {
		return { ok: false, title: "Error", description: "Could not delete notice", variant: "destructive" };
	}
	return { ok: true, title: "Announcement deleted", variant: "default" };
}

export async function pinAnnouncement ( id ) {
	const session = await getServerSession( authOptions );
	if ( !authorize( session, [ s.management ] ) ) {
		return { ok: false, title: "Unauthorized", description: "You are not authorized to pin a notice.", variant: "destructive" };
	}
	console.log( id );
	try {
		//toggle pin
		const announcement = await prisma.globalAnnouncement.findUnique( { where: { id } } );
		await prisma.globalAnnouncement.update( { where: { id }, data: { isPinned: !announcement.isPinned } } );
	} catch ( e ) {
		return { ok: false, title: "Error", description: "Could not pin notice", variant: "destructive" };
	}
	return { ok: true, title: "Notice pinned", variant: "default" };
}
