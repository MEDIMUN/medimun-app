export default async function sendEmail ( emailFrom, emailTo, emailSubject, emailHtml ) {
	const nodemailer = require( "nodemailer" );
	let transporter = nodemailer.createTransport( {
		host: process.env.NODEMAILER_HOST,
		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
			user: process.env.NODEMAILER_USER,
			pass: process.env.NODEMAILER_PASS,
		},
		tls: {
			rejectUnauthorized: false,
		},
	} );

	const mailOptions = {
		from: emailFrom,
		to: emailTo,
		subject: emailSubject,
		html: emailHtml,
		reply
	};
	const res = await transporter.sendMail( mailOptions );
}