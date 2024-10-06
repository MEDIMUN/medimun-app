import { PrismaClient } from "@prisma/client";

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
	prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

/* 
DB_USER='postgres'
DB_PASSWORD='4f9c2779752dea60'
DB_HOST='db1.cluster.medimun.org'
DB_PORT='5432'
DB_NAME='production' */

const db_url = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const prisma =
	global.prisma ||
	new PrismaClient({
		datasources: { db: { url: db_url } },
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
