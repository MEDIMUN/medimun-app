"use server";

import "server-only";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { s, authorize } from "@/lib/authorize";
import { redirect } from "next/navigation";
import prisma from "@/prisma/client";

export async function addDay ( formData ) {
   const session = await getServerSession( authOptions );

   const sessionNumber = formData.get( "sessionNumber" );
   const dayType = formData.get( "type" );
   const dayDate = formData.get( "date" );
   const dayName = formData.get( "name" );
   const dayDescription = formData.get( "description" );

   if ( !authorize( session, [ s.admin, s.sd ] ) ) redirect( `/medibook/sessions/${ sessionNumber }/days` );
   if ( typeof dayType !== "string" || typeof dayDate !== "string" || typeof dayName !== "string" || typeof dayDescription !== "string" ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
   if ( !dayType || !dayDate ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
   if ( dayName && dayName.length > 32 ) return { ok: false, error: "Day name must be at most 32 characters", title: "Day name must be at most 32 characters", variant: "destructive" };
   if ( dayDescription && dayDescription.length > 128 ) return { ok: false, error: "Day description must be at most 128 characters", title: "Day description must be at most 128 characters", variant: "destructive" };
   if ( dayType != "workshop" && dayType != "conference" ) return { ok: false, error: "Day type must be workshop or conference", title: "Day type must be workshop or conference", variant: "destructive" };

   let sessionExists;
   try {
      prisma.$connect();
      sessionExists = await prisma.session.findUnique( {
         where: {
            number: sessionNumber,
         },
      } );
   } catch ( e ) {
      return {
         ok: false,
         error: "Could not check if session exists",
         title: "An error occured, please try again later",
         variant: "destructive",
      };
   }
   if ( !sessionExists ) return { ok: false, error: "Session does not exist", title: "Session does not exist", variant: "destructive" };

   if ( dayType == "workshop" ) {
      let res;
      try {
         prisma.$connect();
         res = await prisma.workshopDay.create( {
            data: {
               name: dayName,
               description: dayDescription,
               date: new Date( dayDate ),
               session: {
                  connect: {
                     number: sessionNumber,
                  },
               },
            },
         } );
      } catch ( e ) {
         return {
            ok: false,
            error: "Could not create workshop day",
            title: "An error occured, please try again later",
            variant: "destructive",
         };
      }

      if ( !res ) return { ok: false, error: "Could not create workshop day", title: "An error occured, please try again later", variant: "destructive" };
   }

   if ( dayType == "conference" ) {
      let res;
      try {
         prisma.$connect();
         res = await prisma.conferenceDay.create( {
            data: {
               name: dayName,
               description: dayDescription,
               date: new Date( dayDate ),
               session: {
                  connect: {
                     number: sessionNumber,
                  },
               },
            },
         } );
      } catch ( e ) {
         return {
            ok: false,
            error: "Could not create conference day",
            title: "An error occured, please try again later",
            variant: "destructive",
         };
      }

      if ( !res ) return { ok: false, error: "Could not create conference day", title: "An error occured, please try again later", variant: "destructive" };
   }
   redirect( `/medibook/sessions/${ sessionNumber }/days` );
}