"use server";

import "server-only";

import prisma from "@/prisma/client";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";

export async function addDepartment ( formData ) {
   const session = await getServerSession( authOptions );
   const sessionNumber = formData.get( 'sessionNumber' );
   const name = formData.get( 'name' );
   const description = formData.get( 'description' );
   const shortName = formData.get( 'shortName' );
   const departmentType = formData.get( 'departmentType' );
   const slug = formData.get( 'slug' );

   if ( !authorize( session, [ s.admins, s.board, s.sec ] ) ) return { ok: false, error: "Unauthorized", title: "Unauthorized", description: "You are not authorized to perform this action", variant: "destructive" };
   if ( !sessionNumber || !name || !departmentType ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all required inputs", variant: "destructive" };
   if ( description && ( description.length > 100 || description.length < 10 ) ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Description must be between 10 and 100 characters", variant: "destructive" };
   if ( name.length > 50 || name.length < 3 ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Name must be between 3 and 50 characters", variant: "destructive" };
   if ( shortName && ( shortName.length > 10 || shortName.length < 2 ) ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Short name must be between 2 and 10 characters", variant: "destructive" };
   if ( slug && ( slug.length > 30 || slug.length < 2 ) ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Slug must be between 2 and 10 characters", variant: "destructive" };
   if ( slug && !/^[a-zA-Z0-9-]*$/.test( slug ) ) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Slug must only contain characters, numbers and dashes", variant: "destructive" };
   if ( slug ) {
      let slugExists;
      try {
         slugExists = await prisma.department.findFirst( { where: { slug, session: { number: sessionNumber } } } );
      } catch ( e ) {
         return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while adding the department", variant: "destructive" };
      }
      if ( slugExists ) return { ok: false, error: "Invalid input", title: "Slug already used for another department", variant: "destructive" };
   }

   try {
      await prisma.department.create( {
         data: {
            name,
            description,
            shortName,
            slug: slug,
            type: departmentType || null,
            session: {
               connect: {
                  number: sessionNumber
               }
            }
         }
      } );
   } catch ( e ) {
      console.log( e );
      return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while adding the department", variant: "destructive" };
   }
   return { ok: true, title: "Department added", description: "The department was successfully added", variant: "default" };
}