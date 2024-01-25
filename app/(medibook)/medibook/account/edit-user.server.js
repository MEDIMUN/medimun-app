"use server";

import "server-only";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { countries } from "@/data/countries";
import prisma from "@/prisma/client";

function nameCase ( name ) {
   const capitalize = ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ).toLowerCase();
   const capitalized = name
      .replace( /[^a-zA-Z-' ]/g, "" )
      .split( /\s|-/ )
      .map( capitalize )
      .join( " " )
      .replace( /-/g, " - " );
   return capitalized;
}

export async function editUser ( formData ) {
   const session = await getServerSession( authOptions );
   if ( !authorize( session, [ s.management ] ) ) redirect( "/" );
   if ( !session ) redirect( "/" );
   let user = {
      id: session.user.id,
      officialName: formData.get( "officialName" ).trim(),
      officialSurname: formData.get( "officialSurname" ),
      displayName: formData.get( "displayName" ) || null,
      email: formData.get( "email" ).trim().toLowerCase(),
      dateOfBirth: formData.get( "dateOfBirth" ) ? new Date( formData.get( "dateOfBirth" ) ) : null,
      phoneCode: formData.get( "phoneCode" ) || null,
      phoneNumber: formData.get( "phoneNumber" ) || null,
      pronoun1: formData.get( "pronoun1" ) || null,
      pronoun2: formData.get( "pronoun2" ) || null,
      gender: formData.get( "gender" ) || null,
      nationality: formData.get( "nationality" ) || null,
      username: formData.get( "username" ) || null,
      bio: formData.get( "bio" ) || null,
   };
   const schoolId = formData.get( "schoolId" ) == 'null' ? "" : formData.get( "schoolId" );

   // Capitalise each word and other formatting
   user.officialName = nameCase( user.officialName );
   user.officialSurname = nameCase( user.officialSurname );
   user.displayName = user.displayName ? nameCase( user.displayName ) : null;

   // Validations
   if ( !user.officialName ) {
      return { ok: false, title: "Official name is required", variant: "destructive" };
   }
   if ( !user.officialSurname ) {
      return { ok: false, title: "Official surname is required", variant: "destructive" };
   }
   if ( !user.email ) {
      return { ok: false, title: "Email is required", variant: "destructive" };
   }
   if ( !user.dateOfBirth ) {
      return { ok: false, title: "Date of birth is required", variant: "destructive" };
   }

   // Phone number and code validation
   if ( ( user.phoneCode && !user.phoneNumber ) || ( !user.phoneCode && user.phoneNumber ) ) {
      return { ok: false, title: "Phone number and phone code must be both filled or both empty", variant: "destructive" };
   }
   if ( user.phoneNumber && isNaN( user.phoneNumber ) ) {
      return { ok: false, title: "Phone number must be a number", variant: "destructive" };
   }

   // Phone code validation
   if ( user.phoneCode && !countries.find( ( country ) => country.countryCode === user.phoneCode ) ) {
      return { ok: false, title: "Phone code is not valid", variant: "destructive" };
   }

   // Nationality validation
   if ( user.nationality && !countries.find( ( country ) => country.countryCode === user.nationality ) ) {
      return { ok: false, title: "Nationality is not valid", variant: "destructive" };
   }

   // Username validation
   if ( user.username ) {
      //length validation doesnt apply if user is admin or globaladmin or senior director
      if ( !authorize( session, [ s.admins, s.sd ] ) ) {
         if ( user.username.length < 3 || user.username.length > 32 ) {
            return { ok: false, title: "Username must be between 3 and 32 characters long", variant: "destructive" };
         }
      }
      if ( !user.username.match( /^[a-z]/ ) ) {
         return { ok: false, title: "Username must start with a letter", variant: "destructive" };
      }
      if ( !user.username.match( /^[a-z0-9_]*[a-z0-9]$/ ) ) {
         return { ok: false, title: "Username must contain only lowercase letters, numbers, underscores, and must end with a letter or number", variant: "destructive" };
      }
      if ( user.username.match( /__+/ ) ) {
         return { ok: false, title: "Username must not contain two underscores in a row", variant: "destructive" };
      }
   }

   // Bio validation
   if ( user.bio && user.bio.length > 500 ) {
      return { ok: false, title: "Bio must be less than 500 characters", variant: "destructive" };
   }

   // Gender validation
   if ( user.gender && ![ "MALE", "FEMALE", "NONBINARY", "OTHER", "PREFERNOTTOANSWER" ].includes( user.gender ) ) {
      return { ok: false, title: "Invalid gender. Must be one of Male, Female, Non-Binary, Other, Prefer not to Answer", variant: "destructive" };
   }

   // Pronouns validation
   if ( user.pronoun1 && ![ "HE", "SHE", "THEY" ].includes( user.pronoun1 ) ) {
      return { ok: false, title: "Invalid pronoun 1. Must be one of He, She, They", variant: "destructive" };
   }
   if ( user.pronoun2 && ![ "HIM", "HER", "THEM" ].includes( user.pronoun2 ) ) {
      return { ok: false, title: "Invalid pronoun 2. Must be one of Him, Her, Them", variant: "destructive" };
   }


   try {
      await prisma.user.update( {
         where: {
            id: user.id
         },
         data: {
            ...user,
         },
      } );
   } catch ( e ) {
      if ( e.meta?.target[ 0 ] == "username" ) return { ok: false, title: "Username already in use", variant: "destructive" };
      return { ok: false, title: "Error updating user", variant: "destructive" };
   }


   if ( schoolId ) {
      await prisma.student.upsert( {
         where: {
            userId: user.id
         },
         create: {
            userId: user.id,
            schoolId: schoolId
         },
         update: {
            schoolId: schoolId
         }
      } ).catch( ( e ) => {
         return { ok: false, title: "Error creating user", variant: "destructive" };
      } );
   } else {
      await prisma.student.delete( {
         where: {
            userId: user.id
         }
      } ).catch( ( e ) => {
         return { ok: false, title: "Error creating user", variant: "destructive" };
      } );
   }
   return { ok: true, title: "User updated", variant: "default" };
};
