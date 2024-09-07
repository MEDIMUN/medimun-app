export default async function sendEmailTransport(options) {
	const { to, subject, html, text, replyTo = "info@medimun.org" } = options;

	const nodemailer = require("nodemailer");
	let transporter = nodemailer.createTransport({
		host: process.env.NODEMAILER_HOST,
		port: process.env.NODEMAILER_PORT,
		secure: process.env.NODEMAILER_SECURE == "true",
		auth: {
			user: process.env.NODEMAILER_USER,
			pass: process.env.NODEMAILER_PASS,
		},
		tls: { rejectUnauthorized: false },
	});

	const mailOptions = {
		from: `MEDIMUN <${process.env.NODEMAILER_EMAIL}>`,
		to,
		subject,
		html,
		text,
		replyTo,
	};

	const response = await transporter.sendMail(mailOptions).catch((err) => {
		console.error(err);
	});
	console.log(response?.accepted);
}
