import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET ( request, { params } ) {
   const search = params.searchParams;
   const sessions = await prisma.session.findMany( {
      where: {
         OR: [ {
            number: { contains: search }
         }, {
            theme: {
               contains: search, mode: 'insensitive'
            }
         } ]
      },
      orderBy: {
         number: "asc"
      },
      take: 5,
   } );
   return NextResponse.json( { sessions: sessions } );
}