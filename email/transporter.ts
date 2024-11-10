let globalTransporter; // Global variable for storing the transporter

export default async function sendEmailTransport(options) {
	const { to, subject, html, text, replyTo = "medimun.cyprus@gmail.com" } = options;

	if (!globalTransporter) {
		const nodemailer = require("nodemailer");
		globalTransporter = nodemailer.createTransport({
			host: process.env.NODEMAILER_HOST,
			port: process.env.NODEMAILER_PORT,
			secure: process.env.NODEMAILER_SECURE === "true",
			auth: {
				user: process.env.NODEMAILER_USER,
				pass: process.env.NODEMAILER_PASS,
			},
			tls: { rejectUnauthorized: false },
			pool: true,
		});
	}

	const mailOptions = {
		from: `MEDIMUN <${process.env.NODEMAILER_EMAIL}>`,
		to,
		subject,
		html,
		text,
		replyTo,
	};

	return await globalTransporter.sendMail(mailOptions);
}
