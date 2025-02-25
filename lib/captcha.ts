"use server";

import axios from "axios";

export async function verifyCaptcha(token) {
	const res = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`);
	if (res.data.success) {
		return "success!";
	} else {
		throw new Error("Failed Captcha");
	}
}

export async function verifyServerCaptcha(token) {
	const res = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`);
	if (res.data.success) {
		return true;
	}
	return false;
}
