"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";

export async function updateSession ( formData ) {
   const session = await getServerSession( authOptions );
   if ( !authorize( session, [ s.management ] ) ) return { ok: false, title: "You are not authorized to edit a session", variant: "destructive" };
   try {
      await prisma.session.update( {
         where: {
            id: formData.get( "sessionId" )
         }, data: {
            theme: formData.get( "theme" ),
            phrase2: formData.get( "phrase2" )
         }
      } );
   } catch {
      return { ok: false, title: "Error", description: "Could not update session", variant: "destructive" };
   }
   return { ok: true, title: "Success", description: "Session updated", variant: "default" };
}

export async function addRollCall ( formData ) {
   const session = await getServerSession( authOptions );
   if ( !authorize( session, [ s.management ] ) ) return { ok: false, title: "You are not authorized", variant: "destructive" };
   try {
      await prisma.rollCall.create( {
         data: {
            session: {
               connect: {
                  id: formData.get( "sessionId" )
               }
            },
            name: formData.get( "name" ),
            description: formData.get( "description" ),
            date: formData.get( "date" ),
            time: formData.get( "time" ),
            duration: formData.get( "duration" ),
            active: formData.get( "active" ) === "on",
            phrase: formData.get( "phrase" )
         }
      } );
   } catch {
      return { ok: false, title: "Error", description: "Could not update session", variant: "destructive" };
   }
   return { ok: true, title: "Success", description: "Session updated", variant: "default" };
}