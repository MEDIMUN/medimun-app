"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";


export async function deleteLocation ( locationId ) {
   const session = await getServerSession( authOptions );
   if ( !session ) notFound();
   if ( !authorize( session, [ s.management ] ) ) notFound();
   await prisma.location.delete( { where: { id: locationId } } ).catch();
   return { ok: true, title: "Location deleted", variant: "default" };
}