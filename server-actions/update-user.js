"use server";

import "server-only";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { titleCase } from "@/lib/title-case";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authorize, s, authorizeByCommittee, authorizeBySchool, authorizeByDepartment } from "@/lib/authorize";
import { userData } from "@lib/user-data";

export async function updateUser ( newUserForm, userIdToBeUpdated ) {
   const session = await getServerSession( authOptions );
   const userId = userIdToBeUpdated || session.user.id;
   if ( userIdToBeUpdated ) {
      const isManagement = authorize( session, [ s.management ] );
      const isChair = authorize( session, [ s.chair ] );
      const isManager = authorize( session, [ s.manager ] );
      const isSchoolDirector = authorize( session, [ s.schooldirector ] );
      if ( !( isManagement || isChair || isManager || isSchoolDirector ) ) return {
         ok: false,
         title: "You are not allowed to edit this user",
         variant: "destructive",
      };
      const { currentRoles, user, highestRoleRank } = await userData( userIdToBeUpdated );
      if ( session.highestRoleRank > highestRoleRank ) return {
         ok: false,
         title: "You are not allowed to edit this user",
         variant: "destructive",
      };
      if ( !isManagement && isChair && !authorizeByCommittee( session.currentRoles, currentRoles ) ) {
         return {
            ok: false,
            title: "You are not allowed to edit this user",
            variant: "destructive",
         };
      }
      if ( !isManagement && isManager && !authorizeByDepartment( session.currentRoles, currentRoles ) ) {
         return {
            ok: false,
            title: "You are not allowed to edit this user",
            variant: "destructive",
         };
      }
      if ( !isManagement && isSchoolDirector && !authorizeBySchool( session.user, user ) ) {
         return {
            ok: false,
            title: "You are not allowed to edit this user",
            variant: "destructive",
         };
      }
   }

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
   if ( newUserForm.bio && typeof newUserForm.bio !== "string" ) return { ok: false, title: "Bio is required", variant: "destructive" };
   if ( newUserForm.bio && newUserForm.bio.length > 1000 ) return { ok: false, title: "Bio is too long", variant: "destructive" };
   if ( newUserForm.bio && newUserForm.bio.length < 2 ) return { ok: false, title: "Bio is too short", variant: "destructive" };

   let newUser = {
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
      bio: newUserForm.bio.trim() || null,
   };

   if ( newUserForm.email && userIdToBeUpdated ) {
      const proposedEmail = newUserForm.email.trim().toLowerCase();
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if ( !emailRegex.test( proposedEmail ) ) return { ok: false, title: "Email is invalid", variant: "destructive" };
      let otherUserHasEmail;
      if ( userId.length === 12 && /^\d+$/.test( userId ) ) {
         otherUserHasEmail = await prisma.user.findFirst( { where: { email: proposedEmail, NOT: { id: userId } } } ).catch( () => { return { ok: false, title: "Something went wrong", variant: "destructive" }; } );
      } else {
         otherUserHasEmail = await prisma.user.findFirst( { where: { email: proposedEmail, NOT: { username: userId } } } ).catch( () => { return { ok: false, title: "Something went wrong", variant: "destructive" }; } );
      }
      if ( otherUserHasEmail ) return { ok: false, title: "Email is already in use", variant: "destructive" };
      newUser.email = proposedEmail;
   }

   try {
      if ( userId.length === 12 && /^\d+$/.test( userId ) ) {
         await prisma.user.update( {
            where: {
               id: userId
            },
            data: newUser,
         } );
      } else {
         await prisma.user.update( {
            where: {
               username: userId
            },
            data: newUser,
         } );
      }
   } catch ( e ) {
      return { ok: false, title: "Something went wrong", variant: "destructive" };
   }
   return { ok: true, title: "The information has been updated", description: "It may take a few minutes for changes to be reflected across all MEDIMUN services." };
}