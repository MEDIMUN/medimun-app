import prisma from "../../../client";

export default async function handler(req, res) {
	if (!req.method == "PATCH") {
		return;
	}
	try {
		await prisma.$connect();
		const data = JSON.parse(req.body);
		const req_evi = data.req_evi;
		const req_code = data.req_code;
		const pendingUser = await prisma.pendingUser.findFirstOrThrow({
			where: {
				email_verification_identifier: req_evi,
			},
		});

		console.log("HELLO");
		console.log(pendingUser.email_verification_token);
		console.log(req_code);
		if (pendingUser.email_verification_token === req_code) {
			console.log("TRUE");
			const user = await prisma.user.create({
				data: {
					email: pendingUser.email,
					password: pendingUser.password,
					official_name: pendingUser.official_name,
					official_surname: pendingUser.official_surname,
					display_name: pendingUser.display_name,
					display_surname: pendingUser.display_surname,
					dob: pendingUser.dob,
					is_email_verified: true,
				},
			});
		}
		const result = await prisma.pendingUser.delete({
			where: {
				email: pendingUser.email,
			},
		});
		res.status(200).json({ message: "User created" });
	} catch (e) {
		console.dir(e);
		res.status(500).json({ message: "Internal Server Error HAHA" });
	}
}
