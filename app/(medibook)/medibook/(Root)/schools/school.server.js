"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";


export async function deleteSchool ( schoolId ) {
   const session = await getServerSession( authOptions );
   if ( !session ) notFound();
   if ( !authorize( session, [ s.management ] ) ) notFound();
   await prisma.school.delete( { where: { id: schoolId } } ).catch();
   return { ok: true, title: "School deleted", variant: "default" };
}