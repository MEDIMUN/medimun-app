"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";
import { notFound, useSearchParams } from "next/navigation";
import prisma from "@/prisma/client";
import { userData } from "@/lib/user-data";

function error ( e ) { console.log( e );; }

export async function toggleDisableUser ( userId ) {
	const session = await getServerSession( authOptions );
	const highestRoleRank = session.highestRoleRank;
	if ( !session ) notFound();
	if ( !authorize( session, [ s.management ] ) ) notFound();
	const userToBeDisabled = await userData( userId );
	if ( !userToBeDisabled ) return { ok: false, title: "Error", variant: "error" };
	if ( userToBeDisabled.highestRoleRank < highestRoleRank || userToBeDisabled.highestRoleRank == highestRoleRank ) return { ok: false, title: "You can't disable a user with a higher or an equal rank", variant: "destructive" };
	const user = ( await prisma.user.findUnique( { where: { id: userId } } ).catch() ).isDisabled;
	await prisma.user.update( { where: { id: userId }, data: { isDisabled: !user, }, } ).catch( ( e ) => { return { ok: false, title: "Error", variant: "error" }; } );
	return { ok: true, title: `User ${ user ? "Enabled" : "Disabled" }`, variant: "default" };
}

export async function addRole ( formData ) {
	const session = await getServerSession( authOptions );
	const highestRoleRank = session.highestRoleRank;
	if ( !session ) notFound();
	if ( !authorize( session, [ s.management ] ) ) notFound();
	let { users, roleName, sessionId, committeeId, departmentId, country, schoolId, jobDescription = null } = Object.fromEntries( formData ), selectedUsers = [];
	users = users.split( "," );
	if ( ![ "delegate", "chair", "member", "manager", "schoolDirector", "deputyPresidentOfTheGeneralAssembly", "deputySecretaryGeneral", "presidentOfTheGeneralAssembly", "secretaryGeneral", "director", "seniorDirector", "admin", "globalAdmin" ].includes( roleName ) ) return { ok: false, title: "Error", variant: "destructive" };
	if ( users.length > 20 ) return { ok: false, title: "Can't edit more than 20 users at once.", variant: "destructive" };
	for ( const userId of users ) { const user = await userData( userId ); if ( user ) selectedUsers.push( user ); }
	const usersToBeAssignedRoles = selectedUsers.filter( ( user ) => { return user.highestRoleRank > highestRoleRank; } ).map( ( { user } ) => { return user.id; } );
	if ( !usersToBeAssignedRoles ) return { ok: false, title: "Error", variant: "destructive" };

	switch ( roleName ) {
		case "delegate": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.delegate.upsert( { where: { userId_committeeId: { userId, committeeId, }, }, update: { userId, country, committeeId, }, create: { userId, country, committeeId, }, } ); } ) ).catch( e => error( e ) ); break;
		case "chair": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.chair.upsert( { where: { userId_committeeId: { userId, committeeId, }, }, update: { userId, committeeId, }, create: { userId, committeeId, }, } ); } ) ).catch( e => error( e ) ); break;
		case "member": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.member.upsert( { where: { userId_departmentId: { userId, departmentId, }, }, update: { userId, departmentId, jobDescription }, create: { userId, departmentId, jobDescription }, } ); } ) ).catch( e => error( e ) ); break;
		case "manager": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.manager.upsert( { where: { userId_departmentId: { userId, departmentId, }, }, update: { userId, departmentId, }, create: { userId, departmentId, }, } ); } ) ).catch( e => error( e ) ); break;
		case "schoolDirector": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.schoolDirector.upsert( { where: { userId_schoolId_sessionId: { userId, schoolId, sessionId }, }, update: { userId, schoolId, sessionId }, create: { userId, schoolId, sessionId }, } ); } ) ).catch( e => error( e ) ); break;
		case "deputyPresidentOfTheGeneralAssembly": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.deputyPresidentOfTheGeneralAssembly.upsert( { where: { userId_sessionId: { userId, sessionId, }, }, update: { userId, sessionId, }, create: { userId, sessionId, }, } ); } ) ).catch( e => error( e ) ); break;
		case "deputySecretaryGeneral": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.deputySecretaryGeneral.upsert( { where: { userId_sessionId: { userId, sessionId, }, }, update: { userId, sessionId, }, create: { userId, sessionId, }, } ); } ) ).catch( e => error( e ) );
		case "presidentOfTheGeneralAssembly": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.presidentOfTheGeneralAssembly.upsert( { where: { userId_sessionId: { userId, sessionId, }, }, update: { userId, sessionId, }, create: { userId, sessionId, }, } ); } ) ).catch( e => error( e ) ); break;
		case "secretaryGeneral": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.secretaryGeneral.upsert( { where: { userId_sessionId: { userId, sessionId, }, }, update: { userId, sessionId, }, create: { userId, sessionId, }, } ); } ) ).catch( e => error( e ) ); break;
		case "director": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.director.upsert( { where: { id: userId, }, update: { id: userId, }, create: { id: userId }, } ); } ) ).catch( e => error( e ) ); break;
		case "seniorDirector": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.seniorDirector.upsert( { where: { id: userId }, update: { id: userId }, create: { id: userId } } ); } ) ).catch( e => error( e ) ); break;
		case "admin": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.admin.upsert( { where: { id: userId }, update: { id: userId }, create: { id: userId } } ); } ) ).catch( e => error( e ) ); break;
		case "globalAdmin": await prisma.$transaction( usersToBeAssignedRoles.map( ( userId ) => { return prisma.globalAdmin.upsert( { where: { id: userId }, update: { id: userId }, create: { id: userId } } ); } ) ).catch( e => error( e ) ); break;
	}
	return { ok: true, title: "Roles added", variant: "default" };
}

export async function removeRole ( role, user ) {
	const session = await getServerSession( authOptions );
	const highestRoleRank = session.highestRoleRank;
	if ( !session ) notFound();
	if ( !authorize( session, [ s.management ] ) ) notFound();
	if ( !user ) return { ok: false, title: "Error", variant: "error" };
	const userToBeUpdated = await userData( user.user.id );
	if ( userToBeUpdated.highestRoleRank < highestRoleRank || userToBeUpdated.highestRoleRank == highestRoleRank ) return { ok: false, title: "You can't edit a user with a higher or an equal rank", variant: "destructive" };
	const userId = userToBeUpdated.user.id;
	const roleIdentifier = role.roleIdentifier;
	const committeeId = role.committeeId;
	const departmentId = role.departmentId;
	const schoolId = role.schoolId;
	const sessionId = role.sessionId;

	//only a single user can be updated
	switch ( roleIdentifier ) {
		case "delegate":
			try {
				await prisma.delegate.delete( {
					where: {
						userId_committeeId: {
							userId,
							committeeId
						}
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "chair":
			try {
				await prisma.chair.delete( {
					where: {
						userId_committeeId: {
							userId,
							committeeId
						}
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "member":
			try {
				await prisma.member.delete( {
					where: {
						userId_departmentId: {
							userId,
							departmentId
						}
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "manager":
			try {
				await prisma.manager.delete( {
					where: {
						userId_departmentId: {
							userId,
							departmentId
						}
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "schoolDirector":
			try {
				await prisma.schoolDirector.delete( {
					where: {
						userId_schoolId_sessionId: {
							userId,
							schoolId,
							sessionId
						}
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "deputyPresidentOfTheGeneralAssembly":
			try {
				await prisma.deputyPresidentOfTheGeneralAssembly.delete( {
					where: {
						userId_sessionId: {
							userId,
							sessionId
						}
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "deputySecretaryGeneral":
			try {
				await prisma.deputySecretaryGeneral.delete( {
					where: {
						userId_sessionId: {
							userId,
							sessionId
						}
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "presidentOfTheGeneralAssembly":
			try {
				await prisma.presidentOfTheGeneralAssembly.delete( {
					where: {
						userId_sessionId: {
							userId,
							sessionId
						}
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "secretaryGeneral":
			try {
				await prisma.secretaryGeneral.delete( {
					where: {
						userId_sessionId: {
							userId,
							sessionId
						}
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "director":
			try {
				await prisma.director.delete( {
					where: {
						id: userId
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "seniorDirector":
			try {
				await prisma.seniorDirector.delete( {
					where: {
						id: userId
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "admin":
			try {
				await prisma.admin.delete( {
					where: {
						id: userId
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
			break;
		case "globalAdmin":
			try {
				await prisma.globalAdmin.delete( {
					where: {
						id: userId
					}
				} );
			} catch { return { ok: false, title: "Error removing role", variant: "destructive" }; }
	}
	return { ok: true, title: "Role removed", variant: "default" };
}

export async function prune ( users ) {

	return { ok: true, title: "Pruned", variant: "default" };
}