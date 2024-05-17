"use server";

import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import "server-only";

export async function pinAnnouncement ( announcementId ) {
   if ( !announcementId ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
   const session = await getServerSession( authOptions );
   const { currentRoles } = session;

   //eaither from management or chair of committee
   const committeeExists = await prisma.committee.findMany( {
      where: {
         announcement: {
            some: {
               id: announcementId
            }
         }
      },
      select: {
         id: true
      }
   } ).catch( e => {
      return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while creating the announcement", variant: "destructive" };
   } );

   if ( !committeeExists.length ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
   const currentChairRoles = currentRoles.filter( role => role.committeeId === committeeExists[ 0 ].id && role.name === "chair" );
   const isChair = currentChairRoles.length > 0;
   if ( !authorize( session, [ s.management ] ) && !isChair ) return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };

   const currentlyAnnouncementPinned = await prisma.committeeAnnouncement.findFirstOrThrow( {
      where: {
         id: announcementId,
      },
      select: {
         isPinned: true,
      }
   } ).catch( e => {
      return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while creating the announcement", variant: "destructive" };
   } );

   try {
      await prisma.committeeAnnouncement.update( {
         data: {
            isPinned: !currentlyAnnouncementPinned.isPinned,
         },
         where: {
            id: announcementId,
         }
      } );
   } catch ( e ) {
      return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while creating the announcement", variant: "destructive" };
   }
   return { ok: true, title: "Announcement created", description: "Announcement created successfully", variant: "default" };
}