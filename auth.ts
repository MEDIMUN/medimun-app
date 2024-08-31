import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/prisma/client";
import { verifyPassword } from "@/lib/password";
import { userData } from "./lib/user";
import { JWT } from "next-auth/jwt";

class InvalidPasswordError extends CredentialsSignin {
	code = "Your password is incorrect";
}

class UserNotFoundError extends CredentialsSignin {
	code = "User not found";
}

class AccountNotActivatedError extends CredentialsSignin {
	code = "Account not activated";
}

class AccountDisabledError extends CredentialsSignin {
	code = "Account disabled";
}

class NoCredentialsError extends CredentialsSignin {
	code = "No credentials provided";
}

class InternalServerError extends CredentialsSignin {
	code = "Internal Server Error";
}

/* Delegate: 9,
"School Director": 8,
Member: 7,
Chair: 6,
Manager: 6,
"Deputy Secretary-General": 5,
"Deputy President of the General Assembly": 5,
"President of the General Assembly": 4,
"Secretary-General": 4,
Director: 3,
"Senior Director": 2,
Admin: 1,
"Global Admin": 0, */

export type RoleName =
	| "Delegate"
	| "School Director"
	| "Member"
	| "Chair"
	| "Manager"
	| "Deputy Secretary-General"
	| "Deputy President of the General Assembly"
	| "President of the General Assembly"
	| "Secretary-General"
	| "Director"
	| "Senior Director"
	| "Admin"
	| "Global Admin";

export interface RoleObject {
	roleIdentifier:
		| "delegate"
		| "schoolDirector"
		| "seniorDirector"
		| "member"
		| "chair"
		| "manager"
		| "deputySecretaryGeneral"
		| "deputyPresidentOfTheGeneralAssembly"
		| "presidentOfTheGeneralAssembly"
		| "secretaryGeneral"
		| "director"
		| "seniorDirector"
		| "admin"
		| "globalAdmin";
	shortRole:
		| "delegate"
		| "schoolDirector"
		| "sd"
		| "member"
		| "chair"
		| "manager"
		| "dsg"
		| "dpga"
		| "pga"
		| "sg"
		| "director"
		| "seniorDirector"
		| "admin"
		| "globalAdmin";
	name: RoleName;
	sessionId?: string;
	session?: string;
	departmentId?: string;
	department?: string;
	committeeId?: string;
	committee?: string;
	committeeSlug?: string;
	schoolId?: string;
	school?: string;
}

interface UserObject {
	id: string;
	username: string;
	email: string;
	schoolName?: string;
	schoolId?: string;
	avatar: string;
	officialName: string;
	officialSurname: string;
	displayName: string;
	isDisabled: boolean;
	pronouns: string;
	currentRoles: RoleObject[];
	currentRoleNames: string[];
	pastRoles: RoleObject[];
	pastRoleNames: string[];
}

declare module "next-auth/jwt" {
	interface JWT {
		user: UserObject & DefaultSession["user"];
		currentRoles: RoleObject[];
		currentRoleNames: string[];
		highestRoleRank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
		pastRoles: RoleObject[];
		pastRoleNames: string[];
		lastUpdated: number;
	}
}

declare module "next-auth" {
	interface Session {
		user: UserObject & DefaultSession["user"];
		currentRoles: RoleObject[];
		currentRoleNames: string[];
		highestRoleRank: number;
		pastRoles: RoleObject[];
		pastRoleNames: string[];
		lastUpdated: number;
	}
}

export const { auth, handlers, signIn, signOut } = NextAuth({
	session: {
		strategy: "jwt",
	},
	providers: [
		Credentials({
			credentials: {
				username: { label: "Username", type: "text", placeholder: "Enter your Email, UserID or Username" },
				password: { label: "Password", type: "password", placeholder: "Enter your Password" },
			},
			async authorize(credentials, req) {
				let { username, password } = credentials;
				username = username.trim().toLowerCase();
				password = password.trim();

				if (!credentials.username || !credentials.password) {
					throw new NoCredentialsError();
				}
				let userDetails;
				try {
					await prisma.$connect();
					userDetails = await prisma.user.findFirst({
						where: { OR: [{ email: username }, { id: username }, { username: username }] },
						include: { account: true },
					});
				} catch (error) {
					throw new InternalServerError();
				}
				if (userDetails === null) {
					throw new UserNotFoundError();
				}
				if (!userDetails.account) {
					throw new AccountNotActivatedError();
				}
				if (userDetails.isDisabled) {
					throw new AccountDisabledError();
				}
				const isPasswordValid = await verifyPassword(password, userDetails.account.password);
				if (isPasswordValid) {
					const user = await userData(userDetails.id);
					delete user.user.bio;
					delete user.user.phoneCode;
					delete user.user.phoneNumber;
					delete user.user.nationality;
					delete user.user.dateOfBirth;
					return user;
				} else {
					throw new InvalidPasswordError();
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger }) {
			//const timeNow = Date.now();
			if (user) {
				//token.lastUpdated = timeNow;
				token.user = user.user;
				//
				token.user.currentRoles = user.currentRoles;
				token.user.currentRoleNames = user.currentRoleNames;
				token.user.highestRoleRank = user.highestRoleRank;
				token.user.pastRoles = user.pastRoles;
				token.user.pastRoleNames = user.pastRoleNames;
				//
				token.currentRoles = user.currentRoles;
				token.currentRoleNames = user.currentRoleNames;
				token.highestRoleRank = user.highestRoleRank;
				token.pastRoles = user.pastRoles;
				token.pastRoleNames = user.pastRoleNames;
				return token;
			} else {
				/* 				const timeExpire = token.lastUpdated;
				if (!(timeNow - timeExpire > 10 * 1000 || trigger == "update")) return token;
            */
				const data = await userData(token.user.id);
				if (data.user.isDisabled) return token;
				delete data.user.bio;
				delete data.user.phoneCode;
				delete data.user.phoneNumber;
				delete data.user.nationality;
				delete data.user.dateOfBirth;
				token.user = data.user;
				//
				token.user.currentRoles = data.currentRoles;
				token.user.currentRoleNames = data.currentRoleNames;
				token.user.highestRoleRank = data.highestRoleRank;
				token.user.pastRoles = data.pastRoles;
				token.user.pastRoleNames = data.pastRoleNames;
				//
				token.currentRoles = data.currentRoles;
				token.currentRoleNames = data.currentRoleNames;
				token.highestRoleRank = data.highestRoleRank;
				token.pastRoles = data.pastRoles;
				token.pastRoleNames = data.pastRoleNames;
				//token.lastUpdated = timeNow;
			}
			return token;
		},
		async session({ session, token }) {
			session.user = token.user;
			session.currentRoles = token.currentRoles;
			session.currentRoleNames = token.currentRoleNames;
			session.highestRoleRank = token.highestRoleRank;
			session.pastRoles = token.pastRoles;
			session.pastRoleNames = token.pastRoleNames;
			//
			session.user.currentRoles = token.user.currentRoles;
			session.user.currentRoleNames = token.user.currentRoleNames;
			session.user.highestRoleRank = token.user.highestRoleRank;
			session.user.pastRoles = token.user.pastRoles;
			session.user.pastRoleNames = token.user.pastRoleNames;
			//
			session.user.lastUpdated = token.lastUpdated;
			return session;
		},
	},
	trustHost: true,
	logger: {
		error: () => {},
		warn: () => {},
		debug: () => {},
	},
	pages: { signIn: "/login" },
});
