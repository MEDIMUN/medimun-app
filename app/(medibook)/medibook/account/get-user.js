"use server";

import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";

export async function getUser () {
	const userId = ( await getServerSession( authOptions ) ).user.id;
	if ( !userId ) notFound();
	let user;
	try {
		user = await prisma.user.findUnique( {
			where: {
				id: userId,
			},
			select: {
				id: true,
				officialName: true,
				officialSurname: true,
				displayName: true,
				email: true,
				phoneNumber: true,
				phoneCode: true,
				dateOfBirth: true,
				nationality: true,
				gender: true,
				pronoun1: true,
				pronoun2: true,
			},
		} );
	} catch ( error ) {
		console.log( "error", error );
		return notFound();
	}
	if ( !user ) notFound();
	return user;
}
