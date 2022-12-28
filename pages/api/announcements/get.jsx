import { getSession } from "next-auth/react";
import prisma from "../../../prisma/client";

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

	if (role === 0) {
		const announcements = prisma.announcementFor.findMany({});
	}
}
