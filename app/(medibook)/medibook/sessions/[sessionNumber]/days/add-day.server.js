"use server";

import "server-only";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { s, authorize } from "@/lib/authorize";
import { redirect } from "next/navigation";
import prisma from "@/prisma/client";
import { v4 as uuidv4 } from "uuid";

export async function addDay ( formData ) {
   const session = await getServerSession( authOptions );
   if ( !session || !authorize( session, [ s.sd, s.admins ] ) ) {
      return { ok: false, title: "Not authorized", variant: "destructive" };
   }

   const sessionNumber = formData.get( "sessionNumber" );
   const editId = formData.get( "editId" );
   const locationId = formData.get( "locationId" ) || null;
   const date = new Date( formData.get( "date" ) ).toISOString();
   const name = formData.get( "name" );
   const description = formData.get( "description" );
   const type = formData.get( "type" );


   let sessionExists;
   try {
      sessionExists = await prisma.session.findUniqueOrThrow( {
         where: {
            number: sessionNumber,
         },
      } );
   } catch ( editId ) {
      return { ok: false, title: "Session does not exist", variant: "destructive" };
   }
   //delete location data of day
   if ( editId ) {
      try {
         await prisma.day.update( {
            where: {
               id: editId,
            },
            data: {
               locationId: null,
            },
         } );
      } catch ( e ) {
      }
   }
   const uuid = uuidv4();
   let connect;
   if ( locationId == "undefined" ? null : locationId ) {
      connect = {
         connect: {
            id: locationId,
         }
      };
   } else {
      connect = {};
   }
   try {
      await prisma.day.upsert( {
         where: {
            id: editId || uuid,
         },
         create: {
            name: name,
            description: description,
            date: date,
            type: type,
            session: {
               connect: {
                  number: sessionNumber,
               },
            },
            location: connect,
         },
         update: {
            name: name,
            description: description,
            date: date,
            type: type,
            session: {
               connect: {
                  number: sessionNumber,
               },
            },
         }
      } );
      if ( locationId != "undefined" && editId ) {
         try {
            await prisma.day.update( {
               where: {
                  id: editId || uuid,
               },
               data: {
                  location: {
                     connect: {
                        id: locationId,
                     },
                  },
               },
            } );
         } catch ( e ) {
            return { ok: false, error: "Error connecting location", title: "Error connecting location", variant: "destructive" };
         }
      }
   } catch ( e ) {
      console.log( e );
      return { ok: false, error: "Error creating day", title: "Error creating day", variant: "destructive" };
   }
   return { ok: true, title: "Day created", variant: "default" };
}

export async function deleteDay ( dayId ) {
   const session = await getServerSession( authOptions );
   if ( !session || !authorize( session, [ s.sd, s.admins ] ) ) {
      return { ok: false, title: "Not authorized", variant: "destructive" };
   }

   try {
      await prisma.day.delete( {
         where: {
            id: dayId,
         },
      } );
   } catch ( e ) {
      return { ok: false, title: "Error deleting day", variant: "destructive" };
   }



   return { ok: true, title: "Day deleted", variant: "default" };
}