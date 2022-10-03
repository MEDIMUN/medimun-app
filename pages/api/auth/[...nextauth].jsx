import NextAuth, { NextAuthOptions } from "next-auth";
import { connectToDatabase } from "../../../lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "../../../lib/auth";

export default NextAuth({
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider({
			type: "credentials",
			credentials: {},
			async authorize(credentials, req) {
				const client = await connectToDatabase();
				const usersCollection = await client.db().collection("users");
				const user = await usersCollection.findOne({
					email: credentials.email,
				});
				if (!user) {
					console.log("user not found");
					throw new Error("no user found");
				}
				const isValid = await verifyPassword(credentials.password, user.password);
				if (!isValid) {
					/* REMOVE CONSOLE LOG
					 */
					console.log("incorrect password");
					client.close();
					throw new Error("could not log you in");
				}
				client.close();
				/* REMOVE CONSOLE LOG
				 */
				console.log("logged in w password");

				return { email: user.email, role: user.role };
			},
		}),
	],
	pages: { signIn: "/auth" },
	secret: "12345678",
});
