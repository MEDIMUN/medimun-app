import { Prisma } from "@prisma/client";

export default async function handler(req, res) {
	if (req.method !== "GET") {
		res.status(401);
		return;
	}
}
