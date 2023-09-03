import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@lib/auth";
import prisma from "@client";
import { userData } from "@lib/user-data";

export const authOptions = {
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider( {
			type: "credentials",
			credentials: {},
			async authorize ( credentials, req ) {
				const username = credentials.email.trim().toLowerCase();
				const password = credentials.password.trim();
				if ( !username || !password ) {
					throw new Error( "Please enter a username and password" );
				}
				let userDetails;
				try {
					await prisma.$connect();
					userDetails = await prisma.user.findFirst( {
						where: { OR: [ { email: username }, { userNumber: username }, { username: username } ] },
						include: { account: true },
					} );
				} catch ( error ) {
					throw new Error( "Internal Server Error, please try again later" );
				}
				if ( userDetails === null ) {
					throw new Error( "No user found" );
				}
				if ( !userDetails.account ) {
					throw new Error( "The account has not been activated yet" );
				}
				if ( userDetails.isDisabled ) {
					throw new Error( "This account has been disabled, please contact us for more information" );
				}
				if ( ( password === userDetails.account.password ) ) {
					const user = await userData( userDetails.userNumber );
					return user;
				} else {
					throw new Error( "Incorrect Password" );
				}
				throw new Error( "Internal Server Error, please try again later" ); //check this
			},
		} ),
	],
	callbacks: {
		async jwt ( { token, user, trigger } ) {
			const timeNow = Date.now();
			if ( user ) {
				token.user = user.user;
				token.currentRoles = user.currentRoles;
				token.currentRoleNames = user.currentRoleNames;
				token.pastRoles = user.pastRoles;
				token.pastRoleNames = user.pastRoleNames;
				token.lastUpdated = timeNow;
				token.signOut = false;
				return token;
			} else {
				//				if ( trigger !== "update" ) return token;
				const timeExpire = token.lastUpdated;
				if ( !( timeNow - timeExpire > 10 * 1000 ) ) return token;
				const data = await userData( token.user.userNumber );
				if ( data.user.isDisabled ) return token;
				token.user = data.user;
				token.currentRoles = data.currentRoles;
				token.currentRoleNames = data.currentRoleNames;
				token.pastRoles = data.pastRoles;
				token.pastRoleNames = data.pastRoleNames;
				token.lastUpdated = timeNow;
				token.signOut = false;
			}
			return token;
		},
		async session ( { session, token } ) {
			session.user = token.user;
			session.currentRoles = token.currentRoles;
			session.currentRoleNames = token.currentRoleNames;
			session.pastRoles = token.pastRoles;
			session.pastRoleNames = token.pastRoleNames;
			session.lastUpdated = token.lastUpdated;
			session.signOut = token.signOut;
			return session;
		},
	},
	pages: { signIn: "/login" },
};
const handler = NextAuth( authOptions );
export { handler as GET, handler as POST };