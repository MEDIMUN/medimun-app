import { useSession, getSession } from "next-auth/react";
import { findUserDetails } from "@lib/user-roles";

export default async function handler ( req, res )
{
   const session = await getSession( { req } );

   if ( req.method !== 'GET' || !session )
   {
      return res.status( 404 ).end();
   }


   const userDetails = await findUserDetails( session.user.userNumber );
   console.log( "BOOOOOM" );

   res.status( 200 ).json( {
      userUpdate: {
         user: {
            officialName: userDetails.user.officialName,
            officialSurname: userDetails.user.officialSurname,
            displayName: userDetails.user.displayName ?? "",
            username: userDetails.user.username ?? "",
         },
         highestCurrentRoleName: userDetails.highestCurrentRoleName,
         highestCurrentRole: userDetails.highestCurrentRole,
         allRoleNames: userDetails.allRoleNames,
         allRoles: userDetails.allRoles,
         alCurrentRoleNames: userDetails.allCurrentRoleNames,
         allPastRoleNames: userDetails.allPastRoleNames,
         allCurrentRoles: userDetails.allCurrentRoles,
         allPastRoles: userDetails.allPastRoles,
      }
   }
   );
}

