"use server";

import "server-only";

import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";

export async function addCommittee ( formData ) {
	const session = await getServerSession( authOptions );
	const sessionNumber = formData.get( "sessionNumber" );
	const name = formData.get( "name" );
	const description = formData.get( "description" );
	const shortName = formData.get( "shortName" );
	const committeeType = formData.get( "committeeType" );
	const slug = formData.get( "slug" );
	const topic1 = formData.get( "topic1" );
	const topic2 = formData.get( "topic2" );
	const topic3 = formData.get( "topic3" );

	if ( !authorize( session, [ s.management ] ) )
		return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
	if ( !sessionNumber || !name || !committeeType )
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
	if ( slug ) {
		let slugExists;
		try {
			slugExists = await prisma.committee.findFirst( { where: { slug, session: { number: sessionNumber } } } );
		} catch ( e ) {
			return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while adding the committee", variant: "destructive" };
		}
		if ( slugExists ) return { ok: false, error: "Invalid input", title: "Slug already used for another committee", variant: "destructive" };
	}

	try {
		await prisma.committee.create( {
			data: {
				name,
				description,
				shortName,
				slug: slug,
				type: committeeType,
				topic1,
				topic2,
				topic3,
				session: {
					connect: {
						number: sessionNumber,
					},
				},
			},
		} );
	} catch ( e ) {
		return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while adding the committee", variant: "destructive" };
	}
	return { ok: true, title: "Committee added", description: "The committee was successfully added", variant: "default" };
}
