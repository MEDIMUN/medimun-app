import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { verifyPassword } from "../../../lib/auth";
import prisma from "../../../client";

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
					user = await prisma.user.findFirst({
						where: {
							email: username,
						},
						include: {
							Delegate: {
								include: {
									committee: true,
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							CommitteeChair: {
								include: {
									committee: true,
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							TeamMember: {
								include: {
									team: true,
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							TeamManager: {
								include: {
									team: true,
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							SchoolDirector: {
								include: {
									school: true,
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							Director: {
								include: {
									team: { select: { name: true } },
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							SeniorDirector: true,
							SchoolMember: { select: { school: { select: { name: true } } } },
							SG: {
								include: {
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							PGA: {
								include: {
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							DSG: {
								include: {
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
						},
					});
				} else {
					user = await prisma.user.findFirst({
						where: {
							username: username,
						},
						include: {
							Delegate: {
								include: {
									committee: true,
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							CommitteeChair: {
								include: {
									committee: true,
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							TeamMember: {
								include: {
									team: true,
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							TeamManager: {
								include: {
									team: true,
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							SchoolDirector: {
								include: {
									school: true,
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							Director: {
								include: {
									team: { select: { name: true } },
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							SeniorDirector: true,
							SchoolMember: { select: { school: { select: { name: true } } } },
							SG: {
								include: {
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							PGA: {
								include: {
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
							DSG: {
								include: {
									session: { select: { isCurrent: true, conference_session_number: true } },
								},
							},
						},
					});
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
				if (user.Delegate.role !== null)
					delegateRole = user.Delegate.map((delegate) => {
						return {
							role: "Delegate",
							committee: delegate.committee.name,
							country: delegate.country,
							isCurrent: delegate.session.isCurrent,
						};
					});

				if (user.Delegate.role == null)
					delegateRole = user.Delegate.map((delegate) => {
						return {
							role: "Delegate",
							isCurrent: delegate.session.isCurrent,
						};
					});

				let chairRole = user.CommitteeChair.map((chair) => {
					return {
						role: "Chair",
						committee: chair.committee.name,
						isCurrent: chair.session.isCurrent,
					};
				});
				let teamMemberRole = user.TeamMember.map((teamMember) => {
					return {
						role: "Member",
						committee: teamMember.team.name,
						isCurrent: teamMember.session.isCurrent,
					};
				});
				let teamManagerRole = user.TeamManager.map((teamManager) => {
					return {
						role: "Manager",
						team: teamManager.team.name,
						isCurrent: teamManager.session.isCurrent,
					};
				});
				let sgRole = user.SG.map((sg) => {
					return {
						role: "Secretary-General",
						isCurrent: sg.session.isCurrent,
					};
				});
				let dsgRole = user.DSG.map((dsg) => {
					return {
						role: "Deputy Secretary-General",
						isCurrent: dsg.session.isCurrent,
					};
				});
				let pgaRole = user.PGA.map((pga) => {
					return {
						role: "President of The General Assembly",
						isCurrent: pga.session.isCurrent,
					};
				});
				let schoolDirectorRole = user.SchoolDirector.map((schoolDirector) => {
					return {
						role: "School Director",
						school: schoolDirector.school.name,
						isCurrent: schoolDirector.session.isCurrent,
					};
				});
				let directorRole = user.Director.map((director) => {
					return {
						role: "Director",
						team: director.team.name,
						isCurrent: director.session.isCurrent,
					};
				});
				let seniorDirectorRole = user.SeniorDirector.map((seniorDirector) => {
					return {
						role: "Senior Director",
					};
				});

				current = [
					...seniorDirectorRole,
					...sgRole,
					...dsgRole,
					...pgaRole,
					...directorRole,
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
					...directorRole,
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
					current = { role: "Alumni" };
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
				token.official_name = user.official_name;
				token.official_surname = user.official_surname;
				token.display_name = user.display_name;
				token.display_surname = user.display_surname;
				token.email = user.email;
				token.dob = user.date_of_birth;
				token.roles = user.roles;
			}

			return token;
		},
		async session({ session, token, user, official_name, official_surname, display_name, display_surname, email, dob }) {
			session.user.role = token.role;
			session.user.userNumber = token.userNumber;
			session.user.official_name = token.official_name;
			session.user.official_surname = token.official_surname;
			session.user.display_name = token.display_name;
			session.user.display_surname = token.display_surname;
			session.user.email = token.email;
			session.user.dob = token.dob;
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
