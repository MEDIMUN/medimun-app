"use server";

import "server-only";
import { minio } from "@/minio/client";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import { authorize, s } from "@/lib/authorize";

// Assuming all necessary imports are correctly referenced in your file, as previously outlined

export async function uploadFile ( formData ) {
	const session = await getServerSession( authOptions );
	const sessionUserId = session.user.id;
	if ( !authorize( session, [ s.management ] ) ) return { ok: false, title: "Unauthorized", variant: "destructive" };

	const file = formData.get( "file" );
	console.log( file );
	// File validation
	if ( !file ) return { ok: false, title: "No file selected", variant: "destructive" };
	if ( file.size > 50000000 )
		// 50 MB
		return { ok: false, title: "File is too large", description: "The maximum file size is 50MB", variant: "destructive" };

	const minioClient = minio();
	const fileUuid = `${ uuidv4() }.${ file.name.split( "." )[ file.name.split( "." ).length - 1 ] || "bin" }`;
	const filePath = `files/${ fileUuid }`;

	// Prepare for file upload
	const data = await file.arrayBuffer();
	const buffer = Buffer.from( data );
	try {
		await minioClient.putObject( "medibook", filePath, buffer, null, {
			"Content-Type": file.type,
		} );

		// Save file metadata in the database
		await prisma.sessionResource.create( {
			data: {
				name: formData.get( "name" ) || file.name,
				description: formData.get( "description" ) || null,
				uuid: fileUuid,
				user: {
					connect: {
						id: sessionUserId,
					},
				},
				session: {
					connect: {
						numberInteger: parseInt( formData.get( "sessionNumber" ) ),
					},
				},
			},
		} );

		return { ok: true, title: "File uploaded successfully", description: "The file has been uploaded and is now accessible.", variant: "success" };
	} catch ( error ) {
		console.error( "Error uploading file or saving to database", error );
		return { ok: false, title: "Error uploading file", description: "There was an issue uploading the file. Please try again.", variant: "destructive" };
	}
}
