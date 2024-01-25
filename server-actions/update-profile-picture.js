"use server";

import "server-only";
import { minio } from "@/minio/client";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateProfilePicture ( formData ) {
   const file = formData.get( "profilePicture" );
   if ( !file ) return { ok: false, title: "No file selected", variant: "destructive" };
   if ( file.size > 10000000 ) return { ok: false, title: "File is too large", description: "The maximun file size is 10MB", variant: "destructive" };
   if ( !file.type.includes( "image" ) ) return { ok: false, title: "File is not an image", variant: "destructive" };
   if ( file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/gif" ) return { ok: false, title: "File is not a supported image type", description: "Supported image types are JPEG, PNG and GIF", variant: "destructive" };
   let minioClient = minio();
   const session = ( await getServerSession( authOptions ) ).user;
   let user;

   try {
      user = await prisma.user.findUnique( {
         where: {
            id: session.id,
         },
         select: {
            profilePicture: true,
            id: true,
         },
      } );
   } catch ( error ) {
      console.error( error );
      return { ok: false, title: "Error updating profile picture", variant: "destructive" };
   }
   const currentProfilePicture = user.profilePicture;

   const data = await file.arrayBuffer();
   const buffer = Buffer.from( data );

   const alphanumericString = ( length ) => {
      let result = "";
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const charactersLength = characters.length;
      for ( let i = 0; i < length; i++ ) {
         result += characters.charAt( Math.floor( Math.random() * charactersLength ) );
      }
      return result;
   };

   const randomName = alphanumericString( 32 ) + "." + file.type.split( "/" )[ 1 ];

   if ( currentProfilePicture ) {
      try {
         await minioClient.removeObject( 'medibook', "profile-pictures/" + currentProfilePicture );
      } catch ( error ) {
         console.error( error );
         return { ok: false, title: "Error updating profile picture", variant: "destructive" };
      }
   }

   try {
      const res = await minioClient.putObject( 'medibook', "profile-pictures/" + randomName, buffer );
   } catch ( error ) {
      console.error( error );
      return { ok: false, title: "Error updating profile picture", variant: "destructive" };
   }
   try {
      await prisma.user.update( {
         where: {
            id: session.id,
         },
         data: {
            profilePicture: randomName,
         },
      } );
   } catch ( error ) {
      console.error( error );
      return { ok: false, title: "Error updating profile picture", variant: "destructive" };
   }
   return { ok: true, title: "Profile picture updated" };
};

export async function removeProfilePicture () {
   const session = ( await getServerSession( authOptions ) ).user;
   let user;
   try {
      user = await prisma.user.findUnique( {
         where: {
            id: session.id,
         },
         select: {
            profilePicture: true,
            id: true,
         },
      } );
   } catch ( error ) {
      console.error( error );
      return { ok: false, title: "Error removing profile picture", variant: "destructive" };
   }
   const currentProfilePicture = user.profilePicture;

   if ( currentProfilePicture ) {
      try {
         await minioClient.removeObject( 'medibook', "profile-pictures/" + currentProfilePicture );
      } catch ( error ) {
         console.error( error );
         return { ok: false, title: "Error updating profile picture", variant: "destructive" };
      }
   }

   try {
      await prisma.user.update( {
         where: {
            id: session.id,
         },
         data: {
            profilePicture: null,
         },
      } );
   }
   catch ( error ) {
      console.error( error );
      return { ok: false, title: "Error updating profile picture", variant: "destructive" };
   }
   return { ok: true, title: "Profile picture removed" };
}
