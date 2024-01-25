"use server";

import "server-only";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { countries } from "@/data/countries";
import prisma from "@/prisma/client";
import { capitaliseEachWord } from "@/lib/capitaliseEachWord";

async function generateRandom12DigitNumber () {
	let number = Math.floor( Math.random() * 9 ) + 1;
	const currentYear = new Date().getFullYear().toString();
	for ( let i = 1; i < 8; i++ ) {
		number = number * 10 + Math.floor( Math.random() * 10 );
	}
	const mergedNumber = currentYear.toString() + number.toString();
	const user = await prisma.user.findUnique( { where: { id: mergedNumber } } ).catch( notFound );
	if ( user ) {
		return generateRandom12DigitNumber();
	} else {
		return mergedNumber;
	}
}

export async function addUser ( formData ) {
	const session = await getServerSession( authOptions );
	if ( !authorize( session, [ s.management ] ) ) redirect( "/" );
	if ( !session ) redirect( "/" );
	const id = ( await generateRandom12DigitNumber() ).toString();
	console.log( formData.get( "officialName" ) );
	const user = {
		id: formData.get( "id" ) || id,
		officialName: formData.get( "officialName" ).trim(),
		officialSurname: formData.get( "officialSurname" ),
		displayName: formData.get( "displayName" ) || null,
		email: formData.get( "email" ).trim().toLowerCase(),
		dateOfBirth: formData.get( "dateOfBirth" ) ? new Date( formData.get( "dateOfBirth" ) ) : null,
		phoneCode: formData.get( "phoneCode" ) || null,
		phoneNumber: formData.get( "phoneNumber" ) || null,
		pronoun1: formData.get( "pronoun1" ) || null,
		pronoun2: formData.get( "pronoun2" ) || null,
		gender: formData.get( "gender" ) || null,
		nationality: formData.get( "nationality" ) || null,
		username: formData.get( "username" ) || null,
		bio: formData.get( "bio" ) || null,
		allowProfilePictureUpdate: formData.get( "allowProfilePictureUpdate" ) ? formData.get( "allowProfilePictureUpdate" ) == "true" ? true : false : true,
		allowBioUpdate: formData.get( "allowBioUpdate" ) ? formData.get( "allowBioUpdate" ) == "true" ? true : false : false,
		isProfilePrivate: formData.get( "isProfilePrivate" ) ? formData.get( "isProfilePrivate" ) == "true" ? true : false : false,
	};
	const schoolId = formData.get( "schoolId" ) == 'null' ? "" : formData.get( "schoolId" );
	console.log( schoolId );
	if ( !formData.get( "id" ) ) {
		const student = schoolId ? {
			student: {
				create: {
					school: {
						connect: {
							id: schoolId
						}
					}
				}
			}
		} : {};
		await prisma.user.create( {
			data: {
				...user,
				...student
			},
		} )
			.catch( ( e ) => {
				return { ok: false, title: "Error creating user", variant: "destructive" };
			} );
		return { ok: true, title: "User created", variant: "default" };
	}

	if ( formData.get( "id" ) ) {
		try {
			await prisma.user.update( {
				where: {
					id: user.id
				},
				data: {
					...user,
				},
			} );
		} catch ( e ) {
			console.log( e );
			return { ok: false, title: "Error updating user", variant: "destructive" };
		}

		if ( !schoolId ) {
			await prisma.student.delete( {
				where: {
					userId: user.id
				}
			} ).catch( ( e ) => {
				return { ok: false, title: "Error creating user", variant: "destructive" };
			} );
		} else {
			await prisma.student.upsert( {
				where: {
					userId: user.id
				},
				create: {
					userId: user.id,
					schoolId: schoolId
				},
				update: {
					schoolId: schoolId
				}
			} ).catch( ( e ) => {
				return { ok: false, title: "Error creating user", variant: "destructive" };
			} );
		}
		return { ok: true, title: "User updated", variant: "default" };
	};
}