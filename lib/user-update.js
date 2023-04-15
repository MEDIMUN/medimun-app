import { useContext, useEffect } from "react";
import AppContext from "@app-components/context/Navigation";
import { useRouter } from "next/router";

export function updateUser ( props )
{
   const SidebarCtx = useContext( AppContext );
   const setUserData = SidebarCtx.setUserData;
   const router = useRouter();

   useEffect( () =>
   {
      setUserData( { userUpdate: props } );
   }, [ props, router ] );
}

export function updateUserProps ( userDetails )
{
   return {
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
      allCurrentRoleNames: userDetails.alCurrentRoleNames,
      allPastRoleNames: userDetails.allPastRoleNames,
      allCurrentRoles: userDetails.allCurrentRoles,
      allPastRoles: userDetails.allPastRoles,
   };
}