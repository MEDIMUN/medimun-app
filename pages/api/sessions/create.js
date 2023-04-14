import prisma from "../../../prisma/client";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		res.status(401);
		return;
	}

	const { number } = req.body;
	try {
		const session = await prisma.session.create({
			data: {
				number: parseInt(number),
				isCurrent: false,
			},
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			title: "Error",
			description: "An error occurred while creating the session",
			status: "error",
			duration: 2500,
			isClosable: true,
		});
	}

	res.status(201).json({
		title: "Success",
		description: "Session has been created",
		status: "success",
		duration: 2500,
		isClosable: true,
	});
}
