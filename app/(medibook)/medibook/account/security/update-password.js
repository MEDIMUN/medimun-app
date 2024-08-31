"use server";

const fs = require( 'fs' );

import prisma from "@/prisma/client";
import { hashPassword, verifyPassword } from "@/lib/password";
import { auth } from "@/auth";



export async function updatePassword ( formData ) {
   const { currentPassword, newPassword, confirmNewPassword } = formData;
   await new Promise( resolve => setTimeout( resolve, 2000 ) );
   if ( newPassword !== confirmNewPassword ) return { ok: false, title: "New passwords do not match" };
   if (
      !(
         /[A-Z]/.test( newPassword ) &&
         /[a-z]/.test( newPassword ) &&
         /[0-9]/.test( newPassword ) &&
         /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test( newPassword ) &&
         newPassword.length > 7 &&
         newPassword === confirmNewPassword &&
         newPassword
      )
   ) return { ok: false, title: "New password does not meet requirements" };
   const userId = ( await auth() ).user.id;
   let dbPassword;
   try {
      dbPassword = ( await prisma.user.findUnique( {
         where: {
            id: userId
         },
         select: {
            account: {
               select: {
                  password: true
               }
            }
         },
      } ) ).account.password;
   } catch ( error ) {
      console.error( error );
      return { ok: false, title: "Error updating password" };
   }
   if ( !( await verifyPassword( currentPassword, dbPassword ) ) ) return { ok: false, title: "Current password is incorrect", variant: "destructive", reset: true };
   if ( await verifyPassword( newPassword, dbPassword ) ) return { ok: false, title: "New password cannot be the same as the current password", variant: "destructive", reset: true };
   try {
      await prisma.account.updateMany( {
         where: {
            user: {
               every: {
                  id: userId,
               }
            },
         },
         data: {
            password: await hashPassword( newPassword ),
         },
      }
      );
   } catch ( error ) {
      console.error( error );
      return { ok: false, title: "Error updating password" };
   }
   return { ok: true, title: "Password updated" };
}