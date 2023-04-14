import prisma from "@client";
import { getSession } from "next-auth/react";

export default async function handler ( req, res )
{
   const session = await getSession( { req: req } );
   if ( req.method !== "GET" || !session )
   {
      res.status( 401 );
      return;
   }

   const { number } = await prisma.session.findFirst( {
      where: {
         isCurrent: true,
      },
      select: {
         number: true,
      },
   } );

   console.log( number );

   return res.status( 200 ).json( number );
}