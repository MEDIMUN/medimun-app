import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "../../../lib/auth";
import prisma from "../../../prisma/client";

let current;

export default NextAuth({
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider({
			type: "credentials",
			credentials: {},
			async authorize(credentials, req) {
				let user;
				const username = credentials.email.trim().toLowerCase();

				if (username.includes("@")) {
					try {
						user = await prisma.user.findFirst({
							where: {
								email: username,
							},
							include: {
								delegate: {
									include: {
										committee: true,
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								chair: {
									include: {
										committee: true,
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								member: {
									include: {
										team: true,
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								manager: {
									include: {
										team: true,
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								schoolDirector: {
									include: {
										school: true,
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								seniorDirecor: true,
								schoolStudent: {
									select: { school: { select: { name: true } } },
								},
								secretaryGeneral: {
									include: {
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								presidentOfTheGeneralAssembly: {
									include: {
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								deputySecretaryGeneral: {
									include: {
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
							},
						});
					} catch (e) {
						console.log(e);
					}
				} else {
					try {
						user = await prisma.user.findFirst({
							where: {
								username: username,
							},
							include: {
								delegate: {
									include: {
										committee: true,
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								chair: {
									include: {
										committee: true,
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								member: {
									include: {
										team: true,
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								manager: {
									include: {
										team: true,
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								schoolDirector: {
									include: {
										school: true,
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								seniorDirecor: true,
								schoolStudent: {
									select: { school: { select: { name: true } } },
								},
								secretaryGeneral: {
									include: {
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								presidentOfTheGeneralAssembly: {
									include: {
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
								deputySecretaryGeneral: {
									include: {
										session: {
											select: {
												isCurrent: true,
												number: true,
											},
										},
									},
								},
							},
						});
					} catch (e) {
						console.log(e);
					}
				}
				if (!user) {
					console.log("user not found");
					throw new Error("no user found");
				}
				const isValid = await verifyPassword(credentials.password, user.password.trim());
				if (!isValid) {
					throw new Error("incorrect password");
				}

				let delegateRole;
				if (user.delegate.role !== null)
					delegateRole = user.delegate.map((delegate) => {
						return {
							role: "Delegate",
							committee: delegate.committee.name,
							country: delegate.country,
							isCurrent: delegate.session.isCurrent,
						};
					});

				if (user.delegate.role == null)
					delegateRole = user.delegate.map((delegate) => {
						return {
							role: "Delegate",
							isCurrent: delegate.session.isCurrent,
						};
					});

				let chairRole = user.chair.map((chair) => {
					return {
						role: "Chair",
						committee: chair.committee.name,
						isCurrent: chair.session.isCurrent,
					};
				});
				let teamMemberRole = user.member.map((teamMember) => {
					return {
						role: "Member",
						committee: teamMember.team.name,
						isCurrent: teamMember.session.isCurrent,
					};
				});
				let teamManagerRole = user.manager.map((teamManager) => {
					return {
						role: "Manager",
						team: teamManager.team.name,
						isCurrent: teamManager.session.isCurrent,
					};
				});
				let sgRole = user.secretaryGeneral.map((sg) => {
					return {
						role: "Secretary-General",
						isCurrent: sg.session.isCurrent,
					};
				});
				let dsgRole = user.deputySecretaryGeneral.map((dsg) => {
					return {
						role: "Deputy Secretary-General",
						isCurrent: dsg.session.isCurrent,
					};
				});
				let pgaRole = user.presidentOfTheGeneralAssembly.map((pga) => {
					return {
						role: "President of The General Assembly",
						isCurrent: pga.session.isCurrent,
					};
				});
				let schoolDirectorRole = user.schoolDirector.map((schoolDirector) => {
					return {
						role: "School Director",
						school: schoolDirector.school.name,
						isCurrent: schoolDirector.session.isCurrent,
					};
				});
				let seniorDirectorRole = user.seniorDirecor.map((seniorDirector) => {
					return {
						role: "Senior Director",
					};
				});

				current = [
					...seniorDirectorRole,
					...sgRole,
					...dsgRole,
					...pgaRole,
					...schoolDirectorRole,
					...teamManagerRole,
					...chairRole,
					...teamMemberRole,
					...delegateRole,
				]
					.filter((role) => role.isCurrent)
					.map((role) => {
						delete role.isCurrent;
						return role;
					});

				console.log(current);

				const pastroles = [
					...seniorDirectorRole,
					...sgRole,
					...dsgRole,
					...pgaRole,
					...schoolDirectorRole,
					...teamManagerRole,
					...chairRole,
					...teamMemberRole,
					...delegateRole,
				]
					.filter((role) => !role.isCurrent)
					.map((role) => {
						return {
							role: role.role,
							session: role.session,
						};
					});

				if (current.length == 0 && pastroles.length > 0) {
					current = [{ role: "Alumni" }];
				}

				if (current.length == 0 && pastroles.length == 0) {
					current = [{ role: "Applicant" }];
				}

				user.roles = current;
				return user;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role;
				token.userNumber = user.userNumber;
				token.officialName = user.officialName;
				token.officialSurname = user.officialSurname;
				token.displayName = user.displayName;
				token.displaySurname = user.displaySurname;
				token.email = user.email;
				token.dateOfBirth = user.dateOfBirth;
				token.roles = user.roles;
			}

			return token;
		},
		async session({
			session,
			token,
			user,
			officialName,
			officialSurname,
			displayName,
			displaySurname,
			email,
			dateOfBirth,
		}) {
			session.user.role = token.role;
			session.user.userNumber = token.userNumber;
			session.user.officialName = token.officialName;
			session.user.officialSurname = token.officialSurname;
			session.user.displayName = token.displayName;
			session.user.displaySurname = token.displaySurname;
			session.user.email = token.email;
			session.user.dateOfBirth = token.dateOfBirth;
			session.user.roles = token.roles;
			return session;
		},
	},
	pages: { signIn: "/login" },
	secret: "12345678",
});

//TeamMember               TeamMember[]
//Delegate                 Delegate[]
//SchoolMember             SchoolMember[]
//SchoolDirector           SchoolDirector[]
//CommitteeChair           Chair[]
//TeamManager              TeamManager[]
//ProfilePicture           ProfilePicture[]
