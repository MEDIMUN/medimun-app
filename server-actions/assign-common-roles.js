"use server";

import "server-only";

import { getServerSession } from "next-auth";
import { s, authorize } from "@/lib/authorize";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/prisma/client";
import { countries } from "@/data/countries";

export async function getSessions () {
   const session = await getServerSession( authOptions );
   if ( !authorize( session, [ s.management ] ) ) return { ok: false, error: "You are not allowed to view this page", title: "You are not allowed to view this page", variant: "destructive" };
   const sessions = await prisma.session.findMany( { orderBy: { number: "desc" } } ).catch( ( e ) => { return { ok: false, error: "Could not get sessions" }; } );
   return { ok: true, sessions: sessions };
}

export async function getCommittees ( sessionId ) {
   const session = await getServerSession( authOptions );
   if ( !authorize( session, [ s.management ] ) ) return { ok: false, error: "You are not allowed to view this page", title: "You are not allowed to view this page", variant: "destructive" };
   const committees = await prisma.committee.findMany( { where: { sessionId: sessionId }, orderBy: { name: "asc" } } ).catch( ( e ) => { return { ok: false, error: "Could not get committees" }; } );
   return { ok: true, committees: committees };
}

export async function getDepartments ( sessionId ) {
   const session = await getServerSession( authOptions );
   if ( !authorize( session, [ s.management ] ) ) return { ok: false, error: "You are not allowed to view this page", title: "You are not allowed to view this page", variant: "destructive" };
   const departments = await prisma.department.findMany( { where: { sessionId: sessionId }, orderBy: { name: "asc" } } ).catch( ( e ) => { return { ok: false, error: "Could not get departments" }; } );
   return { ok: true, departments: departments };
}

export async function addRole ( formData ) {
   const errorMessage = { ok: false, error: "Could not add role", title: "Unable to Add Role", title: "An error occured while adding role", variant: "destructive" };
   const session = await getServerSession( authOptions );
   if ( !authorize( session, [ s.management ] ) ) return { ok: false, error: "You are not allowed to view this page", title: "You are not allowed to view this page", variant: "destructive" };
   const role = formData.get( "role" ); //chair, delegate, member or manager
   const sessionId = formData.get( "session" );
   const entityId = formData.get( "entity" );
   const userId = formData.get( "userId" );
   const countryCode = formData.get( "countryCode" );
   //validate role
   if ( !role || !sessionId || !entityId ) return { ok: false, error: "Missing data", title: "Missing data", description: "Please fill all the fields", variant: "destructive" };
   //validate if userId is valid
   const userExists = await prisma.user.findUnique( { where: { id: userId } } ).catch( ( e ) => { return { ok: false, error: "Could not get user" }; } );
   if ( !userExists ) return { ok: false, error: "User does not exist", title: "User does not exist", description: "Please select a valid user", variant: "destructive" };
   //validate if role is valid
   if ( role !== "chair" && role !== "delegate" && role !== "member" && role !== "manager" ) return { ok: false, title: "Invalid role", description: "Please select a valid role", variant: "destructive" };
   //validate if session exists
   const sessionExists = await prisma.session.findUnique( { where: { id: sessionId } } ).catch( ( e ) => { return { ok: false, error: "Could not get session" }; } );
   if ( !sessionExists ) return { ok: false, error: "Session does not exist", title: "Session does not exist", description: "Please select a valid session", variant: "destructive" };
   //validate if entity exists
   let entityExists;
   if ( role === "chair" || role === "delegate" ) { entityExists = await prisma.committee.findUnique( { where: { id: entityId } } ).catch( ( e ) => { return { ok: false, error: "Could not get committee", }; } ); } else { entityExists = await prisma.department.findUnique( { where: { id: entityId } } ).catch( ( e ) => { return errorMessage; } ); }
   if ( !entityExists ) { return { ok: false, error: "Entity does not exist", title: "Entity does not exist", description: "Please select a valid entity", variant: "destructive" }; }
   //validate if role already exists
   if (role === "delegate") {
      //check if country code exists and is one of the country codes in the countries array
      
   }
   let roleExists;
   if ( role === "delegate" ) roleExists = await prisma.delegate.findFirst( { where: { userId: userId, committee: { sessionId: sessionId, id: entityId } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "chair" ) roleExists = await prisma.chair.findFirst( { where: { userId: userId, committee: { sessionId: sessionId, id: entityId } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "member" ) roleExists = await prisma.member.findFirst( { where: { userId: userId, department: { sessionId: sessionId, id: entityId } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "manager" ) roleExists = await prisma.manager.findFirst( { where: { userId: userId, department: { sessionId: sessionId, id: entityId } } } ).catch( ( e ) => { return errorMessage; } );
   if ( roleExists ) return { ok: false, error: "Role already exists", title: "Role already exists", description: "Please select a different role", variant: "destructive" };
   //add role
   if ( role === "delegate" ) await prisma.delegate.create( { data: { user: { connect: { id: userId, } }, committee: { connect: { id: entityId } } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "chair" ) await prisma.chair.create( { data: { user: { connect: { id: userId } }, committee: { connect: { id: entityId } } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "member" ) await prisma.member.create( { data: { user: { connect: { id: userId } }, department: { connect: { id: entityId } } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "manager" ) await prisma.manager.create( { data: { user: { connect: { id: userId } }, department: { connect: { id: entityId } } } } ).catch( ( e ) => { return errorMessage; } );
   return { ok: true, title: "Role Added", variant: "default" };
}

export async function addDirectorRole ( formData ) {
   const errorMessage = { ok: false, error: "Could not add role", title: "Unable to Add Role", title: "An error occured while adding role", variant: "destructive" };
   const session = await getServerSession( authOptions );
   const role = formData.get( "role" ); //chair, delegate, member or manager
   const userId = formData.get( "userId" );
   //validate role
   if ( !role ) return { ok: false, error: "Missing data", title: "Missing data", description: "Please fill all the fields", variant: "destructive" };
   if ( role !== "senior-director" && role !== "director" ) return { ok: false, title: "Invalid role", description: "Please select a valid role", variant: "destructive" };
   //validate if userId is valid
   const userExists = await prisma.user.findUnique( { where: { id: userId } } ).catch( ( e ) => { return { ok: false, error: "Could not get user" }; } );
   if ( !userExists ) return { ok: false, error: "User does not exist", title: "User does not exist", description: "Please select a valid user", variant: "destructive" };
   //validate if role already exists
   let roleExists;
   if ( role === "director" ) roleExists = await prisma.director.findFirst( { where: { userId: userId } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "senior-director" ) roleExists = await prisma.seniorDirector.findFirst( { where: { userId: userId } } ).catch( ( e ) => { return errorMessage; } );
   if ( roleExists ) return { ok: false, error: "Role already exists", title: "Role already exists", description: "Please select a different role", variant: "destructive" };
   //make sure only senior director adds senior director or director
   if ( role === "senior-director" && !authorize( session, [ s.sd, s.admin ] ) ) return { ok: false, error: "You are not allowed to view this page", title: "You are not allowed to view this page", variant: "destructive" };
   if ( role === "director" && !authorize( session, [ s.sd, s.director, s.admin ] ) ) return { ok: false, error: "You are not allowed to view this page", title: "You are not allowed to view this page", variant: "destructive" };
   //add role
   if ( role === "director" ) await prisma.director.create( { data: { user: { connect: { id: userId } } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "senior-director" ) await prisma.seniorDirector.create( { data: { user: { connect: { id: userId } } } } ).catch( ( e ) => { return errorMessage; } );
   return { ok: true, title: "Role Added", variant: "default" };
}

export async function addAdminRole ( formData ) {
   const errorMessage = { ok: false, error: "Could not add role", title: "Unable to Add Role", title: "An error occured while adding role", variant: "destructive" };
   //admin can only add admin, global-admin can add admin, and global-admin
   const session = await getServerSession( authOptions );
   const role = formData.get( "role" ); //chair, delegate, member or manager
   const userId = formData.get( "userId" );
   //validate role
   if ( !role ) return { ok: false, error: "Missing data", title: "Missing data", description: "Please fill all the fields", variant: "destructive" };
   if ( role !== "admin" && role !== "global-admin" ) return { ok: false, title: "Invalid role", description: "Please select a valid role", variant: "destructive" };
   //validate if userId is valid
   const userExists = await prisma.user.findUnique( { where: { id: userId } } ).catch( ( e ) => { return { ok: false, error: "Could not get user" }; } );
   if ( !userExists ) return { ok: false, error: "User does not exist", title: "User does not exist", description: "Please select a valid user", variant: "destructive" };
   //validate if role already exists
   let roleExists;
   if ( role === "admin" ) roleExists = await prisma.admin.findFirst( { where: { userId: userId } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "global-admin" ) roleExists = await prisma.globalAdmin.findFirst( { where: { userId: userId } } ).catch( ( e ) => { return errorMessage; } );
   if ( roleExists ) return { ok: false, error: "Role already exists", title: "Role already exists", description: "Please select a different role", variant: "destructive" };
   //make sure only global admin adds global admin
   if ( role === "global-admin" && !authorize( session, [ s.globalAdmin ] ) ) return { ok: false, error: "You are not allowed to view this page", title: "You are not allowed to view this page", variant: "destructive" };
   if ( role === "admin" && !authorize( session, [ s.admins ] ) ) return { ok: false, error: "You are not allowed to view this page", title: "You are not allowed to view this page", variant: "destructive" };
   //add role
   if ( role === "admin" ) await prisma.admin.create( { data: { user: { connect: { id: userId } } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "global-admin" ) await prisma.globalAdmin.create( { data: { user: { connect: { id: userId } } } } ).catch( ( e ) => { return errorMessage; } );
   return { ok: true, title: "Role Added", variant: "default" };
}

export async function addSecretariatRole ( formData ) {
   const errorMessage = { ok: false, error: "Could not add role", title: "Unable to Add Role", title: "An error occured while adding role", variant: "destructive" };
   //roles are sg for Secretary-General, dsg for Deputy Secretary-General, pga for President of the General Assembly, and dpga for Deputy President of the General Assembly, only director and above roles can assign these roles, each person can only have one secretariat role per session.
   const session = await getServerSession( authOptions );
   const role = formData.get( "role" ); //chair, delegate, member or manager
   const userId = formData.get( "userId" );
   const sessionId = formData.get( "session" );
   //validate role
   if ( !role || !sessionId ) return { ok: false, error: "Missing data", title: "Missing data", description: "Please fill all the fields", variant: "destructive" };
   if ( role !== "sg" && role !== "dsg" && role !== "pga" && role !== "dpga" ) return { ok: false, title: "Invalid role", description: "Please select a valid role", variant: "destructive" };
   //validate if userId is valid
   const userExists = await prisma.user.findUnique( { where: { id: userId } } ).catch( ( e ) => { return { ok: false, error: "Could not get user" }; } );
   if ( !userExists ) return { ok: false, error: "User does not exist", title: "User does not exist", description: "Please select a valid user", variant: "destructive" };
   //validate if role already exists
   let roleExists = [];
   roleExists[ 0 ] = await prisma.secretaryGeneral.findFirst( { where: { userId: userId, session: { id: sessionId } } } ).catch( ( e ) => { return errorMessage; } );
   roleExists[ 1 ] = await prisma.deputySecretaryGeneral.findFirst( { where: { userId: userId, session: { id: sessionId } } } ).catch( ( e ) => { return errorMessage; } );
   roleExists[ 2 ] = await prisma.presidentOfTheGeneralAssembly.findFirst( { where: { userId: userId, session: { id: sessionId } } } ).catch( ( e ) => { return errorMessage; } );
   roleExists[ 3 ] = await prisma.deputyPresidentOfTheGeneralAssembly.findFirst( { where: { userId: userId, session: { id: sessionId } } } ).catch( ( e ) => { return errorMessage; } );
   if ( roleExists[ 0 ] || roleExists[ 1 ] || roleExists[ 2 ] || roleExists[ 3 ] ) return { ok: false, error: "The user can't have multiple secretariat roles in a given session.", title: "A secretariat role alredy exists for the given user", description: "Please select a different role", variant: "destructive" };
   //make sure only director and above adds secretariat roles
   if ( !authorize( session, [ s.director, s.sd, s.admins ] ) ) return { ok: false, error: "You are not allowed to view this page", title: "You are not allowed to view this page", variant: "destructive" };
   //add role
   if ( role === "sg" ) await prisma.secretaryGeneral.create( { data: { User: { connect: { id: userId } }, session: { connect: { id: sessionId } } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "dsg" ) await prisma.deputySecretaryGeneral.create( { data: { user: { connect: { id: userId } }, session: { connect: { id: sessionId } } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "pga" ) await prisma.presidentOfTheGeneralAssembly.create( { data: { user: { connect: { id: userId } }, session: { connect: { id: sessionId } } } } ).catch( ( e ) => { return errorMessage; } );
   if ( role === "dpga" ) await prisma.deputyPresidentOfTheGeneralAssembly.create( { data: { user: { connect: { id: userId } }, session: { connect: { id: sessionId } } } } ).catch( ( e ) => { return errorMessage; } );
   return { ok: true, title: "Role Added", variant: "default" };
}