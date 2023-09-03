import { NextResponse } from 'next/server';
import { minio } from '@/minio/client.js';
import { notFound } from 'next/navigation';

export async function GET ( request, { params } ) {
   const user = params.user;
   let minioClient = minio();
   let url;
   try {
      url = await minioClient.presignedGetObject( 'profile-pictures', '1111111111.JPG', 30 * 60 );
   } catch ( e ) {
      notFound();
   }
   return NextResponse.redirect( url );
}