import { hashPassword } from "../../../lib/auth";
import randomString from "../../../lib/random-string";
import CapitaliseEachWord from "../../../lib/capitalise-each-word";

import prisma from "../../../client";
import sendEmail from "../../../lib/email/verification";

export default async function handler(req, res) {
	if (req.method === "POST") {
		const data = JSON.parse(req.body);
		const email = data.email;
		const password = data.password;
		const confirm_password = data.confirm_password;
		const official_name = data.official_name;
		const official_surname = data.official_surname;
		const display_name = data.display_name;
		const display_surname = data.display_surname;
		const date_of_birth = data.dob + "T00:00:00.000+00:00";

		console.log(data);

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

		console.log("SAME" + usersWithSameEmail);

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

		if (!date_of_birth) {
			res.status(400).json({ message: "Date of birth must be provided" });
			return;
		}

		const random_verification_string = randomString(50, "Aa#Aa#Aa#Aa#Aa#Aa#Aa#Aa#Aa#Aa#Aa#Aa#Aa#Aa#Aa#Aa#Aa");

		const result = await prisma.pendingUser
			.create({
				data: {
					email: email.toLowerCase().trim(),
					password: await hashPassword(password),
					official_name: CapitaliseEachWord(official_name),
					official_surname: CapitaliseEachWord(official_surname),
					display_name: CapitaliseEachWord(display_name),
					display_surname: CapitaliseEachWord(display_surname),
					date_of_birth: date_of_birth,
					email_verification_code: random_verification_string,
				},
			})
			.catch(async (e) => {
				console.error(e);
				res.status(500).json({ message: "An error occurred." });
				return;
			});

		const email_name = CapitaliseEachWord(official_name);
		const email_email = email;

		const emailresponse = await sendEmail(email_email, email_name, random_verification_string);
		res.status(201).json({ message: "created_pending_user", email: email.toLowerCase().trim() });
	}
}
