import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { verifyPassword } from "../../../lib/auth";
import prisma from "../../../client";

export default NextAuth({
	session: {
		strategy: "jwt",
		//		updateAge: 60 * 60 * 2,
	},
	adapter: PrismaAdapter(prisma),
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
					});
				} else {
					user = await prisma.user.findFirst({
						where: {
							username: username,
						},
					});
				}

				if (!user) {
					console.log("user not found");
					throw new Error("no user found");
				}
				const isValid = await verifyPassword(credentials.password, user.password.trim());
				if (!isValid) {
					throw new Error("could not log you in");
				}
				console.log(Error);
				return user;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role;
				token.official_name = user.official_name;
				token.official_surname = user.official_surname;
				token.display_name = user.display_name;
				token.display_surname = user.display_surname;
				token.email = user.email;
				token.dob = user.date_of_birth;
			}
			// Send properties to the client, like an access_token and user id from a provider.
			//			console.log(token);
			return token;
		},
		async session({ session, token, user, official_name, official_surname, display_name, display_surname, email, dob }) {
			// Send properties to the client, like an access_token and user id from a provider.
			session.user.role = token.role;
			session.user.official_name = token.official_name;
			session.user.official_surname = token.official_surname;
			session.user.display_name = token.display_name;
			session.user.display_surname = token.display_surname;
			session.user.email = token.email;
			session.user.dob = token.dob;

			//			console.log(session);
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
