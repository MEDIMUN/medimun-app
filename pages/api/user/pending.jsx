import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../../lib/auth";
import randomString from "../../../lib/random-string";

const prisma = new PrismaClient();

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return;
	}

	const json_data = req.body;
	const data = JSON.parse(json_data);
	const email = data.email;
	console.log(email);
	const password = data.password;
	const confirm_password = data.confirm_password;
	const official_name = data.official_name;
	const official_surname = data.official_surname;
	const display_name = data.display_name;
	const display_surname = data.display_surname;
	const dob = data.date_of_birth;

	prisma.$connect();
	let mailCount = await prisma.user.count({
		where: {
			email: email.toLowerCase().trim(),
		},
	});

	let pendingMailCount = await prisma.pendingUser.count({
		where: {
			email: email.toLowerCase().trim(),
		},
	});

	if (mailCount > 0 || pendingMailCount > 0) {
		res.status(422).json({ message: "User exists already!" });
		await prisma.$disconnect();
		return;
	}

	if (password !== confirm_password) {
		res.status(422).json({ message: "Passwords do not match" });
		await prisma.$disconnect();
		return;
	}

	async function CapitaliseEachWord(string) {
		return string
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	}

	const evi = randomString(15, "A#aA#a#A##AaA#a");

	async function main() {
		await prisma.$connect();
		const result = await prisma.pendingUser.create({
			data: {
				email: email.toLowerCase().trim(),
				password: await hashPassword(password),
				official_name: await CapitaliseEachWord(official_name),
				official_surname: await CapitaliseEachWord(official_surname),
				display_name: await CapitaliseEachWord(display_name),
				display_surname: await CapitaliseEachWord(display_surname),
				date_of_birth: dob,
				email_verification_token: randomString(6, "AA####"),
				email_verification_identifier: evi,
			},
		});
		console.log(result);
	}

	main()
		.then(async () => {
			await prisma.$disconnect();
		})
		.catch(async (e) => {
			console.error(e);
			await prisma.$disconnect();
			res.status(500).json({ message: "An error occurred." });
			return;
		});

	res.status(201).json({ message: "created_pending_user", code: evi, email: email.toLowerCase().trim() });
}
