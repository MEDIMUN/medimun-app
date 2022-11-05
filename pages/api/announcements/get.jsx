import { getSession } from "next-auth/react";
import prisma from "../../../client";

export async function handler(req, res) {
	if (req.method !== "GET") {
		return;
	}

	const session = await getSession({ req: req });
	const role = session.role;
	if (!session) {
		res.status(401).json({ message: "access denied" });
		return;
	}

	prisma.$connect();

	if (role === 0) {
		const announcements = prisma.announcementFor.findMany({});
	}
}
