"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { titleCase } from "@/lib/title-case";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import "server-only";

export async function updateUser ( newUserForm ) {
   const session = await getServerSession( authOptions );
   if ( !session ) notFound();
   const userId = session.user.id;
   console.log( newUserForm );

   if ( !newUserForm ) return notFound();
   if ( !newUserForm.officialName || typeof newUserForm.officialName !== "string" ) return { ok: false, title: "Official name is required", variant: "destructive" };
   if ( !newUserForm.officialSurname || typeof newUserForm.officialSurname !== "string" ) return { ok: false, title: "Official surname is required", variant: "destructive" };
   if ( newUserForm.displayName && typeof newUserForm.displayName !== "string" ) return { ok: false, title: "Display name is required", variant: "destructive" };
   if ( newUserForm.phoneNumber && typeof newUserForm.phoneNumber !== "string" ) return { ok: false, title: "Phone number is required", variant: "destructive" };
   if ( newUserForm.phoneCode && typeof newUserForm.phoneCode !== "string" ) return { ok: false, title: "Phone code is required", variant: "destructive" };
   if ( newUserForm.dateOfBirth && typeof newUserForm.dateOfBirth !== "object" ) return { ok: false, title: "Date of birth is required", variant: "destructive" };
   if ( newUserForm.officialName.length < 2 ) return { ok: false, title: "Official name is too short", variant: "destructive" };
   if ( newUserForm.officialSurname.length < 2 ) return { ok: false, title: "Official surname is too short", variant: "destructive" };
   if ( newUserForm.displayName && newUserForm.displayName.length < 2 ) return { ok: false, title: "Display name is too short", variant: "destructive" };
   if ( newUserForm.phoneNumber && newUserForm.phoneNumber.length < 2 ) return { ok: false, title: "Phone number is too short", variant: "destructive" };
   if ( newUserForm.phoneCode && newUserForm.phoneCode.length < 2 ) return { ok: false, title: "Phone code is too short" };
   if ( newUserForm.dateOfBirth.length < 2 ) return { ok: false, title: "Date of birth is too short", variant: "destructive" };
   if ( newUserForm.officialName.length > 64 ) return { ok: false, title: "Official name is too long", variant: "destructive" };
   if ( newUserForm.officialSurname.length > 64 ) return { ok: false, title: "Official surname is too long", variant: "destructive" };
   if ( newUserForm.displayName && newUserForm.displayName.length > 64 ) return { ok: false, title: "Display name is too long", variant: "destructive" };
   if ( newUserForm.phoneNumber && newUserForm.phoneNumber.length > 20 ) return { ok: false, title: "Phone number is too long", variant: "destructive" };
   if ( newUserForm.phoneCode && newUserForm.phoneCode.length > 4 ) return { ok: false, title: "Phone code is too long", variant: "destructive" };
   if ( newUserForm.dateOfBirth.length > 64 ) return { ok: false, title: "Date of birth is too long", variant: "destructive" };
   if ( newUserForm.pronoun1 && newUserForm.pronoun1.length > 4 ) return { ok: false, title: "Pronoun 1 is too long", variant: "destructive" };
   if ( newUserForm.pronoun2 && newUserForm.pronoun2.length > 4 ) return { ok: false, title: "Pronoun 2 is too long", variant: "destructive" };
   if ( newUserForm.phoneNumber && !newUserForm.phoneCode ) return { ok: false, title: "Phone code is required", variant: "destructive" };
   if ( !newUserForm.phoneNumber && newUserForm.phoneCode ) return { ok: false, title: "Phone number is required", variant: "destructive" };



   const newUser = {
      officialName: titleCase( titleCase( titleCase( newUserForm.officialName?.replace( "  ", "" ).toLowerCase(), " " ), "-" ), "'" ).trim(),
      officialSurname: titleCase( titleCase( titleCase( newUserForm.officialSurname?.replace( "  ", "" ).toLowerCase(), " " ), "-" ), "'" ).trim(),
      displayName: titleCase( titleCase( titleCase( newUserForm.displayName?.replace( "  ", "" ).toLowerCase(), " " ), "-" ), "'" ).trim() || null,
      pronoun1: titleCase( titleCase( titleCase( newUserForm.pronoun1?.replace( " ", "" ).toLowerCase(), " " ), "-" ), "'" ) || null,
      pronoun2: titleCase( titleCase( titleCase( newUserForm.pronoun2?.replace( " ", "" ).toLowerCase(), " " ), "-" ), "'" ) || null,
      gender: titleCase( newUserForm.gender?.replace( " ", "" ).toLowerCase(), " " ) || null,
      dateOfBirth: newUserForm.dateOfBirth,
      nationality: newUserForm.nationality.slice( 0, 2 ).toUpperCase(),
      phoneNumber: newUserForm.phoneNumber.trim().toString() || null,
      phoneCode: newUserForm.phoneCode.trim().toString().slice( 0, 4 ) || null,
   };

   try {
      await prisma.user.update( {
         where: {
            id: userId,
         },
         data: newUser,
      } );
   } catch ( e ) {
      console.log( e );
      return { ok: false, title: "Something went wrong" };
   }
   return { ok: true, title: "Your data has been updated", description: "It may take some time for changes to be reflected everywhere." };
}