import { PrismaClient } from "@prisma/client";

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
	"use cache";
	prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const db_url = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=disable&connection_limit=33`;
const prisma =
	global.prisma ||
	new PrismaClient({
		datasources: { db: { url: db_url } },
	});

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
