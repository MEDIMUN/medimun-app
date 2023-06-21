import { NextResponse } from 'next/server';
import { minio } from '@/minio/client.js';

export async function GET ( request, { params } ) {
   const user = params.user;
   console.log( 'user', user );
   let minioClient = minio();
   const url = await minioClient.presignedGetObject( 'profile-pictures', '1111111111.JPG', 30 * 60 );
   return NextResponse.redirect( url );
}