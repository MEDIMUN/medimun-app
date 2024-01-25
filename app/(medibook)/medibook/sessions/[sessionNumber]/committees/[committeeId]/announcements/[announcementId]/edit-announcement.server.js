"use server";

import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import "server-only";

const capitalizeEachWord = ( str ) => {
   return str.toLowerCase().replace( /\b[a-z]/g, function ( letter ) {
      return letter.toUpperCase();
   } );
};

const sentenceCase = ( str ) => {
   return str.toLowerCase().replace( /(^|[\.\?\!]\s+)([a-z])/g, function ( match, group1, group2 ) {
      return group1 + group2.toUpperCase();
   } );
};

export async function editAnnouncement ( formData ) {
   //TITLE REQUIRED, MAX 128 CHAR, MIN 3 CHAR
   //DESCRIPTION OPTIONAL MAX 1024 CHAR, MIN 10 CHAR
   //PRIVACY REQUIRED, EITHER "ANONYMOUS", "BOARD", "SECRETARIAT", "NORMAL"
   //MARKDOWN REQUIRED, MAX 16384 CHAR
   //COMMITTEEID REQUIRED, NEEDS TO BE VALID FROM COMMITTEE TABLE
   if ( !formData ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
   const session = await getServerSession( authOptions );
   const { currentRoles } = session;
   //check if announcement exists
   const announcementExists = await prisma.committeeAnnouncement.findUniqueOrThrow( {
      where: {
         id: formData.get( "announcementId" ),
      },
      include: {
         committee: true,
      },
   } ).catch( e => {
      return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while creating the announcement", variant: "destructive" };
   } );
   const currentChairRoles = currentRoles.filter( role => role.committeeId === announcementExists.committeeId && role.name === "chair" );
   const isChair = currentChairRoles.length > 0;
   const newAnnouncement = {
      title: capitalizeEachWord( formData.get( "title" ).trim() ),
      description: sentenceCase( formData.get( "description" ).trim() ),
      privacy: formData.get( "privacy" ),
      markdown: formData.get( "markdown" ),
      userId: session.user.id,
      announcementId: formData.get( "announcementId" ),
   };
   //eaither from management or chair of committee
   if ( !authorize( session, [ s.management ] ) && !isChair ) return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
   if ( !newAnnouncement.announcementId || !newAnnouncement.title || !newAnnouncement.markdown || !newAnnouncement.privacy )
      return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all required inputs", variant: "destructive" };
   if ( newAnnouncement.title.length > 128 || newAnnouncement.title.length < 3 )
      return { ok: false, error: "Invalid input", title: "Invalid input", description: "Title must be between 3 and 128 characters", variant: "destructive" };
   if ( newAnnouncement.description && ( newAnnouncement.description.length > 1024 || newAnnouncement.description.length < 10 ) )
      return { ok: false, error: "Invalid input", title: "Invalid input", description: "Description must be between 10 and 1024 characters", variant: "destructive" };
   if ( newAnnouncement.markdown.length > 16384 || newAnnouncement.markdown.length < 10 )
      return { ok: false, error: "Invalid input", title: "Invalid input", description: "Markdown must be between 10 and 16384 characters", variant: "destructive" };
   if ( !/^(ANONYMOUS|BOARD|SECRETARIAT|NORMAL)$/.test( newAnnouncement.privacy ) )
      return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid privacy setting", variant: "destructive" };
   //check if committee exists
   const committeeExists = await prisma.committee.findUnique( {
      where: {
         announcement: {
            some: {
               committeeId: newAnnouncement.committeeId,
            }
         }
      },
   } ).catch( e => {
      return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while creating the announcement", variant: "destructive" };
   } );


   //check if privacy is SECRETARIAT and user is not in secretariat
   if ( newAnnouncement.privacy === "SECRETARIAT" && !authorize( session, [ s.secretariat ] ) )
      return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
   //check if privacy is BOARD and user is not in board
   if ( newAnnouncement.privacy === "BOARD" && !authorize( session, [ s.board ] ) )
      return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
   //check if privacy is ANONYMOUS and user is not in board
   if ( newAnnouncement.privacy === "ANONYMOUS" && !authorize( session, [ s.management ] ) )
      return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
   try {
      await prisma.committeeAnnouncement.update( {
         where: {
            id: newAnnouncement.announcementId,
         },
         data: {
            title: newAnnouncement.title,
            description: newAnnouncement.description,
            privacy: newAnnouncement.privacy,
            markdown: newAnnouncement.markdown,
            editTime: new Date(),
            userId: session.user.id,
         },
      } );
   } catch ( e ) {
      return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while creating the announcement", variant: "destructive" };
   }
   return { ok: true, title: "Announcement created", description: "Announcement created successfully", variant: "default" };
}