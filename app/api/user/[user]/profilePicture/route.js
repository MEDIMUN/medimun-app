import { NextResponse } from 'next/server';
import { minio } from '@/minio/client.js';
import { notFound } from 'next/navigation';
import prisma from '@/prisma/client';

export async function GET ( request, { params } ) {
   let userExists;
   try {
      userExists = await prisma.user.findUnique( {
         where: {
            id: params.user,
         },
         select: {
            profilePicture: true,
         },
      } );
   } catch ( e ) {
      notFound();
   }

   if ( !userExists ) notFound();
   if ( !userExists.profilePicture ) notFound();

   let minioClient = minio();
   let url;
   try {
      url = await minioClient.presignedGetObject( 'medibook', "profile-pictures/" + userExists.profilePicture, 30 * 60 );
   } catch ( e ) {
      notFound();
   }
   return NextResponse.redirect( url );
}