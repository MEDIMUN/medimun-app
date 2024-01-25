"use server";

import 'server-only';

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { countries } from "@/data/countries";
import prisma from '@/prisma/client';


export async function addSchool ( formData ) {
   const session = await getServerSession( authOptions );
   if ( !authorize( session, [ s.management ] ) ) redirect( "/" );
   if ( !session ) redirect( "/" );
   console.log( formData.get( "locationId" ) );
   const school = {
      name: formData.get( "name" ),
      slug: formData.get( "slug" ) || null,
      description: formData.get( "description" ) || null,
      joinYear: parseInt( formData.get( "joinYear" ) ) || null,
      locationId: formData.get( "locationId" ) || null
   };

   //validation
   if ( !school.name || typeof school.name !== "string" ) return { ok: false, title: "Name is required", variant: "destructive" };
   if ( school.name.length < 2 || school.name.length > 64 ) return { ok: false, title: "Name must be 2-64 characters long", variant: "destructive" };

   if ( school.slug ) {
      if ( typeof school.slug !== "string" ) return { ok: false, title: "Slug must be a string", variant: "destructive" };
      if ( school.slug.length < 2 || school.slug.length > 50 ) return { ok: false, title: "Slug must be 2-50 characters long", variant: "destructive" };
      if ( !school.slug.match( /^[a-z0-9-]+$/ ) ) return { ok: false, title: "Slug must be alphanumeric", variant: "destructive" };
   }

   if ( school.description ) {
      if ( typeof school.description !== "string" ) return { ok: false, title: "Description must be a string", variant: "destructive" };
      if ( school.description.length < 10 || school.description.length > 500 ) return { ok: false, title: "Description must be 10-500 characters long", variant: "destructive" };
   }

   //check if join year its 4 digits
   if ( school.joinYear && typeof school.joinYear !== "number" ) return { ok: false, title: "Join year is required", variant: "destructive" };
   if ( school.joinYear && school.joinYear.toString().length !== 4 ) return { ok: false, title: "Join year must be 4 digits", variant: "destructive" };
   if ( school.joinYear && school.joinYear > new Date().getFullYear() ) return { ok: false, title: "Join year cannot be in the future", variant: "destructive" };
   if ( school.joinYear && school.joinYear < 2005 ) return { ok: false, title: "Join year cannot be before 2005", variant: "destructive" };
   if ( school.joinYear && !school.joinYear.toString().match( /^[0-9]+$/ ) ) return { ok: false, title: "Join year must be digits", variant: "destructive" };

   //if locationId is not null, check if it exists
   if ( school.locationId ) {
      if ( typeof school.locationId !== "string" ) return { ok: false, title: "Location must be a string", variant: "destructive" };
      const location = await prisma.location.findUnique( { where: { id: school.locationId } } ).catch( notFound );
      if ( !location ) return { ok: false, title: "Location not found", variant: "destructive" };
   }

   //adapt for school
   const editId = formData.get( "editId" );
   console.log( school );
   if ( editId ) {
      try {
         await prisma.school.update( {
            where: {
               id: editId
            },
            data: {
               ...school
            },
         } );
      } catch ( e ) {
         return { ok: false, title: "Something went wrong", variant: "destructive" };
      }
      return { ok: true, title: "School updated", variant: "default" };
   }
   try {
      await prisma.school.create( {
         data: {
            ...school
         },
      } );
   } catch ( e ) {
      console.log( e );
      return { ok: false, title: "Something went wrong", variant: "destructive" };
   }
   return { ok: true, title: "Location created", variant: "default" };
}