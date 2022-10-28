"use strict";

const nodemailer = require("nodemailer");

let message = {
	from: "medimun@beoz.org",
	to: "berzanozejder@gmail.com",
	subject: "MEDIMUN - Email Verification",
	text: "",
	html: "<p>HTML version of the message</p>",
};

const account = {
	user: "medimun",
	pass: "MEdiMu!n200125!",
};

let transporter = nodemailer.createTransport({
	host: "mail.beoz.org",
	port: 465,
	secure: true, // true for 465, false for other ports
	auth: {
		user: account.user, // generated ethereal user
		pass: account.pass, // generated ethereal password
	},
});
