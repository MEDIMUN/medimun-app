"use server";

import "server-only";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { s, authorize } from "@/lib/authorize";
import { redirect } from "next/navigation";
import prisma from "@/prisma/client";

export async function editSession ( formData ) {
   const session = await getServerSession( authOptions );
   if ( !authorize( session, [ s.admin, s.sd ] ) ) redirect( "/medibook/sessions" );
   const sessionNumber = formData.get( "sessionNumber" );
   const theme = formData.get( "theme" );
   const phrase2 = formData.get( "phrase2" );

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
   if ( typeof theme !== "string" || typeof phrase2 !== "string" ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
   if ( theme && theme.length < 3 ) return { ok: false, error: "Theme must be at least 3 characters", title: "Theme must be at least 3 characters", variant: "destructive" };
   if ( phrase2 && phrase2.length < 3 ) return { ok: false, error: "Phrase 2 must be at least 3 characters", title: "Phrase 2 must be at least 3 characters", variant: "destructive" };
   if ( theme && theme.length > 30 ) return { ok: false, error: "Theme must be at most 30 characters", title: "Theme must be at most 22 characters", variant: "destructive" };
   if ( phrase2 && phrase2.length > 50 ) return { ok: false, error: "Phrase 2 must be at most 50 characters", title: "Phrase 2 must be at most 40 characters", variant: "destructive" };
   try {
      prisma.$connect();
      await prisma.session.update( {
         where: {
            number: sessionNumber,
         },
         data: {
            theme: theme,
            phrase2: phrase2,
         },
      } );
   } catch ( e ) {
      return {
         ok: false,
         error: "Could not update session",
         title: "An error occured, please try again later",
         variant: "destructive",
      };
   }

   redirect( "/medibook/sessions" );
   return {
      ok: true,
      message: "Session updated",
   };
}