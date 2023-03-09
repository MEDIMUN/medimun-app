import { getSession } from "next-auth/react";
import prisma from "../../../prisma/client";

export default async function handler(req, res) {
	const session = await getSession({ req: req });
	const request = req.body;
	console.log(request);
	if (!session) {
		return res.status(401).json({
			title: "Unauthorized",
			description: "You are not authorized to view this page",
			status: "error",
			duration: "1500",
			isClosable: true,
		});
	}
	if (req.method !== "PATCH") {
		return res.status(405).json({
			title: "Method Not Allowed",
			description: "Method not allowed",
			status: "error",
			duration: "1500",
			isClosable: true,
		});
	}
	if (!request.sessionNumber) {
		return res.status(400).json({
			title: "Session number missing",
			description: "Session number is required and can not be empty.",
			status: "error",
			duration: "1500",
			isClosable: true,
		});
	}
	try {
		const data = await prisma.session.update({
			where: {
				id: request.sessionId,
			},
			data: {
				number: parseInt(request.sessionNumber),
				phrase1: request.primaryTheme,
				phrase2: request.secondaryTheme,
			},
		});
		console.log(data);
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			title: "Internal Server Error",
			description: "Internal Server Error",
			status: "error",
			duration: "1500",
			isClosable: true,
		});
	}
	res.status(200).json({
		title: "Success",
		description: "Session updated successfully",
		status: "success",
		duration: "1500",
		isClosable: true,
	});
}
