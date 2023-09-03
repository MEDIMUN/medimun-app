"use server";

import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import "server-only";

export async function createAnnouncement ( formData ) {
   if ( !formData ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
   if ( typeof formData !== "object" ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };

   const committeeId = formData.get( "committeeId" );
   const title = formData.get( "title" );
   const description = formData.get( "description" );
   const markdown = formData.get( "markdown" );
   const isAnonymous = formData.get( "isAnonymous" ) == "on" ? true : false;
   const isBoard = formData.get( "isBoard" ) == "on" ? true : false;
   const isSecretariat = formData.get( "isSecretariat" ) == "on" ? true : false;

   if ( !committeeId || !title || !description || !markdown ) return { ok: false, error: "Invalid input 1", title: "Invalid input", variant: "destructive" };
   if ( typeof committeeId !== "string" || typeof title !== "string" || typeof description !== "string" || typeof markdown !== "string" ) return { ok: false, error: "Invalid input 2", title: "Invalid input", variant: "destructive" };
   if ( title.length < 3 ) return { ok: false, error: "Title must be at least 3 characters", title: "Title must be at least 3 characters", variant: "destructive" };
   if ( title.length > 50 ) return { ok: false, error: "Title must be at most 50 characters", title: "Title must be at most 50 characters", variant: "destructive" };
   if ( description.length < 10 ) return { ok: false, error: "Description must be at least 10 characters", title: "Description must be at least 10 characters", variant: "destructive" };
   if ( description.length > 200 ) return { ok: false, error: "Description must be at most 100 characters", title: "Description must be at most 100 characters", variant: "destructive" };
   if ( markdown.length < 10 ) return { ok: false, error: "Markdown must be at least 10 characters", title: "Markdown must be at least 10 characters", variant: "destructive" };
   if ( markdown.length > 10000 ) return { ok: false, error: "Markdown must be at most 10000 characters", title: "Markdown must be at most 10000 characters", variant: "destructive" };
   if ( typeof isAnonymous !== "boolean" || typeof isBoard !== "boolean" || typeof isSecretariat !== "boolean" ) return { ok: false, error: "Invalid input 3", title: "Invalid input", variant: "destructive" };
   if ( isAnonymous && ( isBoard || isSecretariat ) ) return { ok: false, error: "Invalid input 4", title: "Invalid input", variant: "destructive" };

   const session = await getServerSession( authOptions );

   if ( !( authorize( session, [ s.management ] ) || session.currentRoles.some( ( role ) => role.name === "Chair" && role.committeeId === committeeId ) ) ) {
      return { ok: false, error: "You are not authorized to create announcements.", title: "Unauthorized", variant: "destructive" };
   }

   try {
      await prisma.announcement.create( {
         data: {
            title,
            description,
            markdown,
            isAnonymous,
            isBoard,
            isSecretariat,
            CommitteeAnnouncement: {
               create: {
                  committee: {
                     connect: {
                        id: committeeId
                     }
                  }
               }
            },
            user: {
               connect: {
                  userNumber: session.user.userNumber
               }
            },
         },
      } );
   } catch ( e ) {
      if ( process.env.NODE_ENV == "development" ) console.log( e );
      return { ok: false, error: "Internal server error", title: "An error occured while creating announcement", variant: "destructive" };
   }
   return { ok: true, error: null, title: "Announcement created", variant: "default" };
}