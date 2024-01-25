"use server";

import "server-only";
import { minio } from "@/minio/client";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from 'uuid';
import { authorize, s } from "@/lib/authorize";
import { userData } from "@/lib/user-data";

export async function updateProfilePictureForUser ( targetUserId, formData ) {
   const session = await getServerSession( authOptions );

   // Authorization check for the session user
   if ( !authorize( session, [ s.management ] ) ) {
      return { ok: false, title: "Unauthorized", variant: "destructive" };
   }

   // Retrieve session user and target user data for role comparison
   const sessionUser = await userData( session.user.id );
   const targetUser = await userData( targetUserId );

   // Ensure the management user has a lower rank (more powerful) than the target user
   if ( sessionUser.highestRoleRank > targetUser.highestRoleRank ) {
      return { ok: false, title: "Unauthorized to modify this user", variant: "destructive" };
   }

   const file = formData.get( "profilePicture" );

   // File validation
   if ( !file ) return { ok: false, title: "No file selected", variant: "destructive" };
   if ( file.size > 10000000 ) return { ok: false, title: "File is too large", description: "The maximum file size is 10MB", variant: "destructive" };
   if ( !file.type.includes( "image" ) ) return { ok: false, title: "File is not an image", variant: "destructive" };
   if ( file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/gif" ) return { ok: false, title: "File is not a supported image type", description: "Supported image types are JPEG, PNG, and GIF", variant: "destructive" };

   const minioClient = minio();
   const randomName = uuidv4() + "." + file.type.split( "/" )[ 1 ];

   // Get target user profile
   let userProfile;
   try {
      userProfile = await prisma.user.findUniqueOrThrow( { where: { id: targetUserId } } );
   } catch ( error ) {
      return { ok: false, title: "Error retrieving user profile", variant: "destructive" };
   }

   // Prepare for file upload
   const data = await file.arrayBuffer();
   const buffer = Buffer.from( data );

   // Upload new profile picture to MinIO with retry logic
   const maxUploadRetries = 3;
   let uploadSuccess = false;
   for ( let attempt = 1; attempt <= maxUploadRetries; attempt++ ) {
      try {
         await minioClient.putObject( 'medibook', `avatars/${ randomName }`, buffer, null, {
            'Content-Type': file.type,
         } );
         uploadSuccess = true;
         break; // Exit loop on successful upload
      } catch ( error ) {
         if ( attempt === maxUploadRetries ) {
            return { ok: false, title: "Error uploading new profile picture", variant: "destructive" };
         }
      }
   }

   // Update the database only if upload is successful
   if ( uploadSuccess ) {
      try {
         await prisma.user.update( {
            where: { id: targetUserId },
            data: { profilePicture: randomName }
         } );

         // Delete old profile picture if it exists
         const oldProfilePicture = userProfile.profilePicture;
         if ( oldProfilePicture ) {
            try {
               await minioClient.removeObject( 'medibook', `avatars/${ oldProfilePicture }` );
            } catch ( error ) {
               // Log the error but do not fail the entire operation
               console.error( "Failed to delete old profile picture:", error );
            }
         }

         return { ok: true, title: "Profile picture updated for user" };
      } catch ( error ) {
         // Attempt to delete the new profile picture if database update fails
         try {
            await minioClient.removeObject( 'medibook', `avatars/${ randomName }` );
         } catch ( deletionError ) {
            // Log this error as well
            console.error( "Failed to delete new profile picture after database update failure:", deletionError );
         }
         return { ok: false, title: "Error updating user profile", variant: "destructive" };
      }
   }
}



export async function removeProfilePictureForUser ( targetUserId ) {
   const session = await getServerSession( authOptions );
   const sessionUserId = session.user.id;

   // Retrieve data for session user and target user
   const sessionUser = await userData( sessionUserId );
   const targetUser = await userData( targetUserId );

   if ( !targetUserId ) return { ok: false, title: "No user ID provided", variant: "destructive" };
   if ( !authorize( session, [ s.management ] ) ) return { ok: false, title: "Unauthorized", variant: "destructive" };

   // Check if the session user has higher role rank (more power) than the target user
   if ( sessionUser.highestRoleRank > targetUser.highestRoleRank ) {
      return { ok: false, title: "Unauthorized to modify this user", variant: "destructive" };
   }

   // Retrieve the current profile picture reference from the database for the target user
   let userProfile;
   try {
      userProfile = await prisma.user.findUnique( {
         where: { id: targetUserId },
         select: { profilePicture: true }
      } );
   } catch ( error ) {
      return { ok: false, title: "Error retrieving user data", variant: "destructive" };
   }

   const currentProfilePicture = userProfile.profilePicture;
   if ( !currentProfilePicture ) {
      return { ok: true, title: "No profile picture to remove" };
   }

   // Attempt to delete the file from MinIO
   const maxRetries = 3;
   let deleteSuccess = false;
   for ( let attempt = 1; attempt <= maxRetries; attempt++ ) {
      try {
         await minioClient.removeObject( 'medibook', `avatars/${ currentProfilePicture }` );
         deleteSuccess = true;
         break; // Exit loop on successful deletion
      } catch ( error ) {
         if ( attempt === maxRetries ) {
            return { ok: false, title: "Error removing profile picture from storage", variant: "destructive" };
         }
      }
   }

   // Update the database only if deletion is successful
   if ( deleteSuccess ) {
      try {
         await prisma.user.update( {
            where: { id: targetUserId },
            data: { profilePicture: null }
         } );
         return { ok: true, title: "Profile picture removed" };
      } catch ( error ) {
         return { ok: false, title: "Error updating user data", variant: "destructive" };
      }
   }
}
