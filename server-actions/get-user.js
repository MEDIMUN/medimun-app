"use server";

import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { s, authorize, authorizeByCommittee, authorizeByDepartment, authorizeBySchool } from "@/lib/authorize";
import { userData } from "@/lib/user-data";

export async function getUser ( userId ) {
	const updatingUser = await getServerSession( authOptions );
	let userToBeUpdated;
	if ( !userId ) {
		userToBeUpdated = await userData( updatingUser.user.id );
	} else {
		userToBeUpdated = await userData( userId );
	}
	if ( ( userId && updatingUser.user.id === userId ) || !userId ) return userToBeUpdated;
	if ( updatingUser.user.id === userToBeUpdated.id ) return userToBeUpdated;

	const isManagement = authorize( updatingUser, [ s.management ] );
	const isChair = authorize( updatingUser, [ s.chair ] );
	const isManager = authorize( updatingUser, [ s.manager ] );
	const isSchoolDirector = authorize( updatingUser, [ s.schooldirector ] );

	if ( !( isManagement || isChair || isManager || isSchoolDirector ) && userId ) return {
		ok: false,
		title: "You are not allowed to view this user",
		variant: "destructive",
	};

	if ( !userToBeUpdated || !updatingUser ) notFound();
	if ( isManagement ) return userToBeUpdated;

	const updatingUserRoles = updatingUser.currentRoles;
	const userToBeUpdatedRoles = userToBeUpdated.currentRoles;



	if ( isManager ) {
		if ( authorizeByDepartment( updatingUserRoles, userToBeUpdatedRoles ) ) {
			return userToBeUpdated;
		} else {
			return {
				ok: false,
				title: "You are not allowed to view this user",
				variant: "destructive",
			};
		}
	}

	if ( isChair ) {
		if ( authorizeByCommittee( updatingUserRoles, userToBeUpdatedRoles ) ) {
			return userToBeUpdated;
		} else {
			return {
				ok: false,
				title: "You are not allowed to view this user",
				variant: "destructive",
			};
		}
	}
	if ( isSchoolDirector ) {
		if ( authorizeBySchool( updatingUserRoles, userToBeUpdatedRoles ) ) {
			return userToBeUpdated;
		} else {
			return {
				ok: false,
				title: "You are not allowed to view this user",
				variant: "destructive",
			};
		}
	}

	return {
		ok: false,
		title: "You are not allowed to view this user",
		variant: "destructive",
	};
}
