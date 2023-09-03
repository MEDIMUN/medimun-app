"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/prisma/client";
import { authorize, s } from "@/lib/authorize";
import { redirect } from "next/navigation";

function error ( e ) {
   console.log( e );
   return { ok: false, error: "Error", title: "An error occurred while deleting the announcement", variant: "destructive" };
}

export async function deleteAnnouncement ( announcementId, params ) {
   const session = await getServerSession( authOptions );
   if ( !session || session.isDisabled ) redirect( "/medibook/signout" );
   if ( !authorize( session, [ s.management ] ) ) return { ok: false, error: "You are not authorized to delete announcements.", title: "Unauthorized", variant: "destructive" };
   await prisma.announcement.delete( {
      where: {
         id: announcementId,
      },
   } ).catch( e => error( e ) );
   return redirect( `/medibook/sessions/${ params.sessionNumber }/committees/${ params.committeeId }/announcements/` );
}