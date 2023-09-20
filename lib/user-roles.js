import prisma from "../prisma/client";

function orderRoles ( user ) {
	let delegateRole;
	if ( user.delegate.role !== null )
		delegateRole = user.delegate.map( ( delegate ) => {
			return {
				role: "Delegate",
				committee: delegate.committee.name,
				country: delegate.country,
				isCurrent: delegate.session.isCurrent,
				session: delegate.session.number,
			};
		} );

	if ( user.delegate.role == null )
		delegateRole = user.delegate.map( ( delegate ) => {
			return {
				role: "Delegate",
				isCurrent: delegate.session.isCurrent,
				session: delegate.session.number,
			};
		} );

	let chairRole = user.chair.map( ( chair ) => {
		return {
			role: "Chair",
			committee: chair.committee.name,
			isCurrent: chair.session.isCurrent,
			session: chair.session.number,
		};
	} );
	let teamMemberRole = user.member.map( ( teamMember ) => {
		return {
			role: "Member",
			committee: teamMember.team.name,
			isCurrent: teamMember.session.isCurrent,
			session: teamMember.session.number,
		};
	} );
	let teamManagerRole = user.manager.map( ( teamManager ) => {
		return {
			role: "Manager",
			team: teamManager.team.name,
			isCurrent: teamManager.session.isCurrent,
			session: teamManager.session.number,
		};
	} );
	let sgRole = user.secretaryGeneral.map( ( sg ) => {
		return {
			role: "Secretary-General",
			isCurrent: sg.session.isCurrent,
			session: sg.session.number,
		};
	} );
	let dsgRole = user.deputySecretaryGeneral.map( ( dsg ) => {
		return {
			role: "Deputy Secretary-General",
			isCurrent: dsg.session.isCurrent,
			session: dsg.session.number,
		};
	} );
	let pgaRole = user.presidentOfTheGeneralAssembly.map( ( pga ) => {
		return {
			role: "President of the General Assembly",
			isCurrent: pga.session.isCurrent,
			session: pga.session.number,
		};
	} );
	let schoolDirectorRole = user.schoolDirector.map( ( schoolDirector ) => {
		return {
			role: "School Director",
			school: schoolDirector.school.name,
			isCurrent: schoolDirector.session.isCurrent,
			session: schoolDirector.session.number,
		};
	} );
	let seniorDirectorRole = user.seniorDirecor.map( ( seniorDirector ) => {
		return {
			role: "Senior Director",
			isCurrent: true,
			session: "All",
		};
	} );
	let globalAdminRole = user.globalAdmin.map( ( globalAdmin ) => {
		return {
			role: "Global Admin",
			isCurrent: true,
		};
	} );

	return [ ...globalAdminRole, ...seniorDirectorRole, ...sgRole, ...dsgRole, ...pgaRole, ...schoolDirectorRole, ...teamManagerRole, ...chairRole, ...teamMemberRole, ...delegateRole ];
}

export async function currentUserRoles ( id ) {
	const user = await prisma.user.findFirst( {
		where: {
			id: id,
		},
		include: {
			globalAdmin: true,
			delegate: {
				include: {
					committee: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			chair: {
				include: {
					committee: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			member: {
				include: {
					team: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			manager: {
				include: {
					team: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			schoolDirector: {
				include: {
					school: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			seniorDirecor: true,
			schoolStudent: { select: { school: { select: { name: true } } } },
			secretaryGeneral: {
				include: {
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			presidentOfTheGeneralAssembly: {
				include: {
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			deputySecretaryGeneral: {
				include: {
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
		},
	} );

	return orderRoles( user )
		.filter( ( role ) => role.isCurrent )
		.map( ( role ) => {
			return role.role;
		} );
}

export async function pastUserRoles ( id ) {
	const user = await prisma.user.findFirst( {
		where: {
			id: id,
		},

		include: {
			globalAdmin: true,
			delegate: {
				include: {
					committee: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			chair: {
				include: {
					committee: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			member: {
				include: {
					team: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			manager: {
				include: {
					team: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			schoolDirector: {
				include: {
					school: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			seniorDirecor: true,
			schoolStudent: { select: { school: { select: { name: true } } } },
			secretaryGeneral: {
				include: {
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			presidentOfTheGeneralAssembly: {
				include: {
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			deputySecretaryGeneral: {
				include: {
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
		},
	} );

	return orderRoles( user )
		.filter( ( role ) => !role.isCurrent )
		.map( ( role ) => {
			return {
				role: role.role,
				session: role.session,
			};
		} );
}
//////////////////////////////////////////
export async function findUserDetails ( user ) {
	let id;

	if ( !user ) {
		return {};
	}

	if ( user[ 0 ] == "@" && user.length == 10 ) {
		return {};
	}

	let Query;
	if ( user[ 0 ] == "@" ) {
		Query = await prisma.user.findFirst( {
			where: {
				username: user.slice( 1 ).toString(),
			},
		} );
		id = Query.id;
	} else {
		Query = await prisma.user.findFirst( {
			where: {
				id: user.toString(),
			},
		} );
		id = Query.id;
	}

	const roles = await prisma.user.findFirst( {
		where: {
			id: id.toString(),
		},

		include: {
			globalAdmin: true,
			delegate: {
				include: {
					committee: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			chair: {
				include: {
					committee: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			member: {
				include: {
					team: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			manager: {
				include: {
					team: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			schoolDirector: {
				include: {
					school: true,
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			seniorDirecor: true,
			schoolStudent: { select: { school: { select: { name: true } } } },
			secretaryGeneral: {
				include: {
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			presidentOfTheGeneralAssembly: {
				include: {
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
			deputySecretaryGeneral: {
				include: {
					session: {
						select: { isCurrent: true, number: true },
					},
				},
			},
		},
	} );

	let delegateRole = roles.delegate.map( ( delegate ) => {
		return {
			role: "Delegate",
			committee: delegate.committee.name,
			id: delegate.id,
			country: delegate.country ? delegate.country : "N/A",
			isCurrent: delegate.session.isCurrent,
			session: delegate.session.number,
		};
	} );

	let chairRole = roles.chair.map( ( chair ) => {
		return {
			role: "Chair",
			committee: chair.committee.name,
			id: chair.id,
			isCurrent: chair.session.isCurrent,
			session: chair.session.number,
		};
	} );
	let teamMemberRole = roles.member.map( ( teamMember ) => {
		return {
			role: "Member",
			committee: teamMember.team.name,
			id: teamMember.id,
			isCurrent: teamMember.session.isCurrent,
			session: teamMember.session.number,
		};
	} );
	let teamManagerRole = roles.manager.map( ( teamManager ) => {
		return {
			role: "Manager",
			team: teamManager.team.name,
			id: teamManager.id,
			isCurrent: teamManager.session.isCurrent,
			session: teamManager.session.number,
		};
	} );
	let sgRole = roles.secretaryGeneral.map( ( sg ) => {
		return {
			role: "Secretary-General",
			id: sg.id,
			isCurrent: sg.session.isCurrent,
			session: sg.session.number,
		};
	} );
	let dsgRole = roles.deputySecretaryGeneral.map( ( dsg ) => {
		return {
			role: "Deputy Secretary-General",
			id: dsg.id,
			isCurrent: dsg.session.isCurrent,
			session: dsg.session.number,
		};
	} );
	let pgaRole = roles.presidentOfTheGeneralAssembly.map( ( pga ) => {
		return {
			role: "President of the General Assembly",
			id: pga.id,
			isCurrent: pga.session.isCurrent,
			session: pga.session.number,
		};
	} );
	let schoolDirectorRole = roles.schoolDirector.map( ( schoolDirector ) => {
		return {
			role: "School Director",
			id: schoolDirector.id,
			school: schoolDirector.school.name,
			isCurrent: schoolDirector.session.isCurrent,
			session: schoolDirector.session.number,
		};
	} );
	let seniorDirectorRole = roles.seniorDirecor.map( ( seniorDirector ) => {
		return {
			role: "Senior Director",
			isCurrent: true,
			session: "All",
			id: seniorDirector.id,
		};
	} );
	let globalAdminRole = roles.globalAdmin.map( ( globalAdmin ) => {
		return {
			role: "Global Admin",
			isCurrent: true,
			session: "All",
			id: globalAdmin.id,
		};
	} );

	let allRoles = [ ...globalAdminRole, ...seniorDirectorRole, ...sgRole, ...dsgRole, ...pgaRole, ...schoolDirectorRole, ...teamManagerRole, ...chairRole, ...teamMemberRole, ...delegateRole ];

	let allCurrentRoles = allRoles.filter( ( role ) => role.isCurrent );
	let allPastRoles = allRoles.filter( ( role ) => !role.isCurrent );

	if ( allCurrentRoles.length == 0 && allPastRoles.length == 0 ) {
		allCurrentRoles = [
			{
				role: "Applicant",
				isCurrent: true,
				session: "All",
				id: null,
			},
		];
	}

	if ( allCurrentRoles.length == 0 && allPastRoles.length > 0 ) {
		allCurrentRoles = [
			{
				role: "Alumni",
				isCurrent: true,
				session: "All",
				id: null,
			},
		];
	}

	const allFilteredCurrentRoles = allCurrentRoles.map( ( role ) => {
		return role.role;
	} );

	const allFilteredPastRoles = allPastRoles.map( ( role ) => {
		return role.role;
	} );

	const allFullCurrentRoles = allCurrentRoles.map( ( role ) => {
		return { name: role.role, session: role.session, roleId: role.id };
	} );

	const allFullPastRoles = allPastRoles.map( ( role ) => {
		return { name: role.role, session: role.session, roleId: role.id };
	} );
	const roleNumbers = {
		"Global Admin": 0,
		"Senior Director": 1,
		"Secretary-General": 3,
		"President of the General Assembly": 3,
		"Deputy Secretary-General": 4,
		Manager: 6,
		Chair: 6,
		Member: 7,
		"School Director": 8,
		Delegate: 9,
		Applicant: 11,
		Alumni: 11,
	};

	if ( roles.schoolStudent.length > 0 ) {
		Query.school = roles.schoolStudent[ 0 ].school.name ?? "";
	}

	return {
		user: Query,
		highestCurrentRoleName: allFilteredCurrentRoles[ 0 ],
		highestCurrentRole: allFullCurrentRoles[ 0 ],
		highestCurrentRoleNumber: roleNumbers[ allFilteredCurrentRoles[ 0 ] ],
		allRoleNames: [ ...allFilteredCurrentRoles, ...allFilteredPastRoles ],
		allRoles: [ ...allFullCurrentRoles, ...allFullPastRoles ],
		//
		alCurrentRoleNames: [ ...allFilteredCurrentRoles ],
		allPastRoleNames: [ ...allFilteredPastRoles ],
		//
		allCurrentRoles: [ ...allFullCurrentRoles ],
		allPastRoles: [ ...allFullPastRoles ],
	};
}
