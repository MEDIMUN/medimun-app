"use server";

import "server-only";

import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";

export async function editTopics ( formData ) {
	const session = await getServerSession( authOptions );
	const committeeId = formData.get( "committeeId" );
	let committee = {};
	committee.topic1 = formData.get( "topic1" ).trim();
	committee.topic2 = formData.get( "topic2" ).trim();
	committee.topic3 = formData.get( "topic3" ).trim();
	committee.topic1description = formData.get( "topic1description" ).trim();
	committee.topic2description = formData.get( "topic2description" ).trim();
	committee.topic3description = formData.get( "topic3description" ).trim();

	//IF STATEMET HELL
	if ( !session || session.isDisabled ) return { ok: false, error: "You are not authorized to edit committees.", title: "Unauthorized", variant: "destructive" };
	if ( !authorize( session, [ s.management ] || session?.user?.roles?.some( ( role ) => role.name === "Manager" && role.committeeId === committeeId ) ) ) return { ok: false, error: "You are not authorized to edit committees.", title: "Unauthorized", variant: "destructive" };
	if ( ( committee.topic1 && typeof committee.topic1 !== "string" ) || ( committee.topic2 && typeof committee.topic2 !== "string" ) || ( committee.topic3 && typeof committee.topic3 !== "string" ) ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all fields", variant: "destructive" };
	if ( ( committee.topic1description && typeof committee.topic1description !== "string" ) || ( committee.topic2description && typeof committee.topic2description !== "string" ) || ( committee.topic3description && typeof committee.topic3description !== "string" ) ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all fields", variant: "destructive" };
	if ( !committeeId ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all fields", variant: "destructive" };
	if ( committee.topic1 && committee.topic1.length > 100 ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Topic 1 must be between 1 and 50 characters", variant: "destructive" };
	if ( committee.topic2 && committee.topic2.length > 100 ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Topic 2 must be between 1 and 50 characters", variant: "destructive" };
	if ( committee.topic3 && committee.topic3.length > 100 ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Topic 3 must be between 1 and 50 characters", variant: "destructive" };
	if ( committee.topic1description && !committee.topic1 ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all fields", variant: "destructive" };
	if ( committee.topic2description && !committee.topic2 ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all fields", variant: "destructive" };
	if ( committee.topic3description && !committee.topic3 ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all fields", variant: "destructive" };
	if ( committee.topic1description && committee.topic1description.length > 1000 ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Topic 1 description must be between 1 and 1000 characters", variant: "destructive" };
	if ( committee.topic2description && committee.topic2description.length > 1000 ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Topic 2 description must be between 1 and 1000 characters", variant: "destructive" };
	if ( committee.topic3description && committee.topic3description.length > 1000 ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Topic 3 description must be between 1 and 1000 characters", variant: "destructive" };


	try {
		await prisma.committee.update( {
			where: {
				id: committeeId
			},
			data: {
				...committee
			},
		} );
	} catch ( e ) {
		console.log( e );
		return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while adding the committee", variant: "destructive" };
	}
	return { ok: true, title: "Committee Updated", variant: "default" };
}
