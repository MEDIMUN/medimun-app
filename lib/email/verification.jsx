import { html } from "../../pages/emails/email1";

export default async function sendEmail(email, name, evc, evi) {
	const nodemailer = require("nodemailer");
	const account = {
		user: "noreply@medimun.org",
		pass: "kW3(nxrLPg",
	};
	let transporter = nodemailer.createTransport({
		host: "mail.manage.beoz.org",
		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
			user: account.user, // generated ethereal user
			pass: account.pass, // generated ethereal password
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	const mailOptions = {
		from: "MEDIMUN Email Verification <noreply@medimun.org>",
		to: email,
		subject: "Email Verification for Your Account",
		html: html,
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent: " + info.response);
		}
	});
}
