import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@lib/auth";
import prisma from "@client";
import { setTimeout } from "timers/promises";
import { userData } from "@lib/user-data";

export const authOptions = {
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider({
			type: "credentials",
			credentials: {},
			async authorize(credentials, req) {
				const username = credentials.email.trim().toLowerCase();
				const password = credentials.password.trim();

				await setTimeout(3000);

				if (!username || !password) {
					throw new Error("Please enter a username and password");
				}
				let userDetails;
				try {
					userDetails = await prisma.user.findFirst({
						where: { OR: [{ email: username }, { userNumber: username }, { username: username }] },
						include: { account: true },
					});
				} catch (error) {
					throw new Error("Internal Server Error, please try again later");
				}
				if (userDetails === null) {
					throw new Error("No user found");
				}
				if (!userDetails.account) {
					throw new Error("The account has not been activated yet");
				}
				if (userDetails.isDisabled) {
					throw new Error("This account has been disabled, please contact us for more information");
				}
				if (!(password === userDetails.account.password)) {
					/////////ADD BCRYPTJS//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////REMINDERS/
					throw new Error("Invalid password");
				} else {
					const user = await userData(userDetails.userNumber);
					return user;
				}
				throw new Error("Internal Server Error, please try again later");
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user.user;
				token.user.preferredName = user.user.displayName ? user.user.displayName : user.user.officialName + " " + user.user.officialSurname;
				token.currentRoles = user.currentRoles;
				token.pastRoles = user.pastRoles;
				token.currentRoleNames = user.currentRoleNames;
				token.pastRoleNames = user.pastRoleNames;
				token.lastUpdated = Date.now();
				token.signOut = false;
			}
			return token;
		},
		async session({ session, token }) {
			const timeNow = Date.now();
			const timeExpire = token.lastUpdated;
			if (timeNow - timeExpire > 10 * 1000) {
				const data = await userData(token.user.userNumber);
				if (data.user.isDisabled) {
					token = {};
					session = {};
					return session, token;
				}
				const date = Date.now();
				session.user = data.user;
				session.user.preferredName = data.user.displayName ? data.user.displayName : data.user.officialName + " " + data.user.officialSurname;
				session.currentRoles = data.currentRoles;
				session.pastRoles = data.pastRoles;
				session.currentRoleNames = data.currentRoleNames;
				session.pastRoleNames = data.pastRoleNames;
				session.lastUpdated = date;
				session.signOut = false;
				token.user = data.user;
				token.user.preferredName = data.user.displayName ? data.user.displayName : data.user.officialName + " " + data.user.officialSurname;
				token.currentRoles = data.currentRoles;
				token.pastRoles = data.pastRoles;
				token.currentRoleNames = data.currentRoleNames;
				token.pastRoleNames = data.pastRoleNames;
				token.lastUpdated = date;
				token.signOut = false;
				return session;
			}
			session.user = token.user;
			token.user.preferredName = token.user.preferredName;
			session.currentRoles = token.currentRoles;
			session.pastRoles = token.pastRoles;
			session.currentRoleNames = token.currentRoleNames;
			session.pastRoleNames = token.pastRoleNames;
			session.lastUpdated = token.lastUpdated;
			session.signOut = token.signOut;
			return session;
		},
	},
	pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
