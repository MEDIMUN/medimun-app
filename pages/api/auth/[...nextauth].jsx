import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@lib/auth";
import prisma from "@client";
import { setTimeout } from "timers/promises";

export default NextAuth({
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
				let user;

				if (!username || !password) {
					const error = "Please enter a username and password";
					console.log(error);
					throw new Error(error);
				}

				if (username.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
					console.log("email");
					user = await prisma.user.findUnique({ where: { email: username }, select: { account: true, isDisabled: true, userNumber: true } });
				} else {
					console.log("username");
					user = await prisma.user.findUnique({ where: { username: username }, select: { account: true, isDisabled: true, userNumber: true } });
				}

				if (user === null) {
					const error = "No user found";
					console.log(error);
					throw new Error(error);
				}
				if (!user.account) {
					const error = "The account has not been activated yet";
					console.log(error);
					throw new Error(error);
				}
				if (user.isDisabled) {
					const error = "The account has been disabled";
					console.log(error);
					throw new Error(error);
				}
				if (!(password === user.account.password)) {
					const error = "Invalid password";
					console.log(error);
					throw new Error(error);
				} else {
					console.log("success");
					return user;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			user ? (token.userNumber = user.userNumber) : null;
			return token;
		},
		async session({ session, token }) {
			const timeNow = new Date(session.expires);
			const timeExpire = new Date(token.exp * 1000);
			if (timeNow - timeExpire > 30 * 1000) {
				console.log("more than 10 seconds");
			}
			session.user.userNumber = token.userNumber;
			return session;
		},
	},
	pages: { signIn: "/login" },
	secret: "12345678",
});
