export default async function sendEmail ( options ) {
	const { to, subject, html, text, replyTo = "info@medimun.org" } = options;

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
		from: `Mediterranean Model United Nations <${ process.env.NODEMAILER_USER }>`, to, subject, html, text, replyTo
	};

	const response = await transporter.sendMail( mailOptions ).catch( err => {
	} );
}