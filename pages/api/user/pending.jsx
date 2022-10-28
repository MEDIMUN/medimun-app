import { hashPassword } from "../../../lib/auth";
import randomString from "../../../lib/random-string";
import CapitaliseEachWord from "../../../lib/capitalise-each-word";

import prisma from "../../../client";
import sendEmail from "../../../lib/email/verification";

export default async function handler(req, res) {
	if (req.method === "POST") {
		await prisma.$connect();
		const evi = randomString(10, "A#A#A#A#");

		const data = JSON.parse(req.body);
		const email = data.email;
		const password = data.password;
		const confirm_password = data.confirm_password;
		const official_name = data.official_name;
		const official_surname = data.official_surname;
		const display_name = data.display_name;
		const display_surname = data.display_surname;
		const dob = data.dob;

		const usersWithSameEmail = await prisma.user
			.count({
				where: {
					email: email.toLowerCase().trim(),
				},
			})
			.then((count) => {
				if (count > 0) {
					res.status(400).json({ message: "Email already exists" });
					return count;
				}
			});

		if (usersWithSameEmail > 0) {
			return;
		}

		console.log(usersWithSameEmail);

		const usersWithSamePendingEmail = await prisma.pendingUser.count({
			where: {
				email: email.toLowerCase().trim(),
			},
		});

		if (usersWithSamePendingEmail > 0) {
			const result = await prisma.pendingUser
				.delete({
					where: {
						email: email.toLowerCase().trim(),
					},
				})
				.catch(() => {
					res.status(500).json({ message: "Internal Server Error" });
				});
		}

		if (password !== confirm_password) {
			res.status(400).json({ message: "Passwords do not match" });
			return;
		}

		if (password.length < 8) {
			res.status(400).json({ message: "Password must be at least 8 characters" });
			return;
		}

		if (password.length > 64) {
			res.status(400).json({ message: "Password must be less than 64 characters" });
			return;
		}

		if (email.length < 5) {
			res.status(400).json({ message: "Email must be at least 5 characters" });
			return;
		}

		if (email.length > 64) {
			res.status(400).json({ message: "Email must be less than 64 characters" });
			return;
		}

		if (official_name.length < 1) {
			res.status(400).json({ message: "Official name must be at least 1 character" });
			return;
		}

		if (official_name.length > 64) {
			res.status(400).json({ message: "Official name must be less than 64 characters" });
			return;
		}

		if (official_surname.length < 1) {
			res.status(400).json({ message: "Official surname must be at least 1 character" });
			return;
		}

		if (official_surname.length > 64) {
			res.status(400).json({ message: "Official surname must be less than 64 characters" });
			return;
		}

		if (display_name && display_name.length < 1) {
			res.status(400).json({ message: "Display name must be at least 1 character" });
			return;
		}

		if (display_name && display_name.length > 64) {
			res.status(400).json({ message: "Display name must be less than 64 characters" });
			return;
		}

		if (display_surname && display_surname.length < 1) {
			res.status(400).json({ message: "Display surname must be at least 1 character" });
			return;
		}

		if (display_surname && display_surname.length > 64) {
			res.status(400).json({ message: "Display surname must be less than 64 characters" });
			return;
		}

		if (!dob) {
			res.status(400).json({ message: "Date of birth must be provided" });
			return;
		}

		const email_verification_token = randomString(6, "AA####");

		const result = await prisma.pendingUser
			.create({
				data: {
					email: email.toLowerCase().trim(),
					password: await hashPassword(password),
					official_name: CapitaliseEachWord(official_name),
					official_surname: CapitaliseEachWord(official_surname),
					display_name: CapitaliseEachWord(display_name),
					display_surname: CapitaliseEachWord(display_surname),
					date_of_birth: dob,
					email_verification_token: email_verification_token,
					email_verification_identifier: evi,
				},
			})
			.then(async () => {})
			.catch(async (e) => {
				console.error(e);
				res.status(500).json({ message: "An error occurred." });
				return;
			});

		console.log(result);

		const email_name = CapitaliseEachWord(official_name);
		const email_email = email;
		const email_code = email_verification_token.toUpperCase();

		sendEmail(email_email, email_name, email_code, evi);
		res.status(201).json({ message: "created_pending_user", code: evi, email: email.toLowerCase().trim() });
	}
}
