import { PrismaClient } from "@prisma/client";

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
	prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const prisma =
	global.prisma ||
	new PrismaClient({
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
	}); /* .$extends({
		result: {
			user: {
				fullName: {
					needs: { officialName: true, officialSurname: true, displayName: true },
					compute(user) {
						const { officialName, officialSurname, displayName } = user;
						return displayName || `${officialName} ${officialSurname}`;
					},
				},
			},
		},
	}); */

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
