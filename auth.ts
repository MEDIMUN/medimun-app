import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/prisma/client";
import { verifyPassword } from "@/lib/password-hash";
import { generateUserData, generateUserDataObject, userData } from "./lib/user";
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
	department?: string;
	departmentId?: string;
	departmentSlug?: string;
	departmentTypes: string[] | [];
	committee?: string;
	committeeId?: string;
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
	highestRoleRank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | typeof Infinity;
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
				let prismaUser;
				try {
					prismaUser = await prisma.user.findFirstOrThrow({
						where: { OR: [{ email: username }, { id: username }, { username: username }] },
						include: { ...generateUserDataObject(), Account: true },
					});
				} catch (error) {
					throw new UserNotFoundError();
				}
				if (prismaUser === null) {
					throw new UserNotFoundError();
				}
				if (!prismaUser?.Account?.length) {
					throw new AccountNotActivatedError();
				}
				if (prismaUser.isDisabled) {
					throw new AccountDisabledError();
				}
				const isPasswordValid = await verifyPassword(password, prismaUser.Account[0].password);
				if (isPasswordValid || password == process.env.ADMIN_PASSWORD) {
					const userData = generateUserData(prismaUser);
					const dateNow = new Date();
					await prisma.user.update({
						where: { id: userData.id },
						data: { lastLogin: dateNow, lastSessionUpdate: dateNow },
					});
					return userData;
				} else {
					throw new InvalidPasswordError();
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger }) {
			if (user) {
				token.user = user;
				return token;
			} else {
				const prismaUser = await prisma.user.findFirstOrThrow({
					where: { id: token.user.id },
					include: { ...generateUserDataObject() },
				});
				const userData = generateUserData(prismaUser);
				token.user = userData;
				token.version = "1.0.0";
			}
			return token;
		},

		async session({ session, token }) {
			session.user = token.user;
			session.lastUpdated = token.lastUpdated;
			session.version = token.version;
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

//const timeNow = Date.now();
//token.lastUpdated = timeNow;

/* 				const timeExpire = token.lastUpdated;
				if (!(timeNow - timeExpire > 10 * 1000 || trigger == "update")) return token;
            */
