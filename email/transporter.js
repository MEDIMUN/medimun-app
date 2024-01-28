export default async function sendEmail ( from, to, subject, html, text, replyTo ) {
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
		from, to, subject, html, text, replyTo
	};

	const response = await transporter.sendMail( mailOptions ).catch( err => {
		console.log( err );
	} );
	console.log( { response } );
}