"use server";

import "server-only";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { s, authorize } from "@/lib/authorize";
import { redirect } from "next/navigation";
import prisma from "@/prisma/client";
import { verifyPassword } from "@/lib/auth";

export async function currentSession ( formData ) {
   const session = await getServerSession( authOptions );
   if ( !authorize( session, [ s.admin, s.sd ] ) ) redirect( "/medibook/sessions" );
   const sessionNumber = formData.get( "sessionNumber" );
   const password = formData.get( "password" );
   if ( typeof password !== "string" || !password ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
   if ( !sessionNumber ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
   let sessionExists, currentUser;

   try {
      prisma.$connect();
      currentUser = await prisma.user.findUnique( {
         where: {
            id: session.user.id,
         },
         select: {
            account: {
               select: {
                  password: true,
               },
            },
         },
      } );
   }
   catch ( e ) {
      return {
         ok: false,
         title: "An error occured, please try again later",
         variant: "destructive",
      };
   }
   if ( !currentUser ) return { ok: false, error: "User does not exist", title: "User does not exist", variant: "destructive" };
   if ( !( await verifyPassword( password, currentUser.account.password ) ) ) return { ok: false, error: "Incorrect password", title: "Incorrect password", variant: "destructive" };

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
         title: "An error occured, please try again later",
         variant: "destructive",
      };
   }
   if ( !sessionExists ) return { ok: false, error: "Session does not exist", title: "Session does not exist", variant: "destructive" };
   if ( sessionExists.isCurrent ) return { ok: false, error: "Session is already current", title: "Session is already current", variant: "destructive" };
   if ( !sessionExists.theme ) return { ok: false, error: "Session does not have a theme", title: "Session does not have a theme", variant: "destructive" };
   if ( !sessionExists.phrase2 ) return { ok: false, error: "Session does not have a phrase 2", title: "Session does not have a phrase 2", variant: "destructive" };

   try {
      prisma.$connect();
      prisma.$transaction( [ prisma.session.updateMany( {
         where: {
            isCurrent: true,
         },
         data: {
            isCurrent: false,
         },
      } ),
      prisma.session.update( {
         where: {
            number: sessionNumber,
         },
         data: {
            isCurrent: true,
         },
      } ) ] );
   } catch ( e ) {
      return {
         ok: false,
         title: "An error occured, please try again later",
         variant: "destructive",
      };
   }
   return { ok: true, title: "Updated Current Session", variant: "destructive" };
}