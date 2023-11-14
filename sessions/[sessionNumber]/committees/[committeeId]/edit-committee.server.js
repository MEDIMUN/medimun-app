"use server";

import "server-only";

import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";

export async function editCommittee ( formData ) {
	const session = await getServerSession( authOptions );
	const committeeId = formData.get( "committeeId" ).trim();
	const name = formData.get( "name" ).trim();
	const description = formData.get( "description" ).trim();
	const shortName = formData.get( "shortName" ).trim();
	const committeeType = formData.get( "committeeType" ).trim();
	const slug = formData.get( "slug" ).trim();
	const topic1 = formData.get( "topic1" ).trim();
	const topic2 = formData.get( "topic2" ).trim();
	const topic3 = formData.get( "topic3" ).trim();

	if ( !authorize( session, [ s.management ] ) )
		return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
	if ( !name || !committeeType )
		return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all required inputs", variant: "destructive" };
	if ( description && ( description.length > 1000 || description.length < 10 ) )
		return { ok: false, error: "Invalid input", title: "Invalid input", description: "Description must be between 10 and 1000 characters", variant: "destructive" };
	if ( name.length > 50 || name.length < 3 )
		return { ok: false, error: "Invalid input", title: "Invalid input", description: "Name must be between 3 and 50 characters", variant: "destructive" };
	if ( shortName && ( shortName.length > 10 || shortName.length < 2 ) )
		return { ok: false, error: "Invalid input", title: "Invalid input", description: "Short name must be between 2 and 10 characters", variant: "destructive" };
	if ( slug && ( slug.length > 30 || slug.length < 2 ) )
		return { ok: false, error: "Invalid input", title: "Invalid input", description: "Slug must be between 2 and 10 characters", variant: "destructive" };
	if ( slug && !/^[a-zA-Z0-9-]*$/.test( slug ) )
		return { ok: false, error: "Invalid input", title: "Invalid input", description: "Slug must only contain characters, numbers and dashes", variant: "destructive" };

	try {
		await prisma.committee.update( {
			where: {
				id: committeeId
			},
			data: {
				name,
				description,
				shortName,
				slug: slug,
				type: committeeType,
				topic1,
				topic2,
				topic3,
			},
		} );
	} catch ( e ) {
		return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while adding the committee", variant: "destructive" };
	}
	return { ok: true, title: "Committee Updated", variant: "default" };
}
