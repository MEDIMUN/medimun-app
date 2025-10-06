"use server";

import sendEmailTransport from "@/email/transporter";
/* import { verifyServerCaptcha } from "@/lib/captcha";
 */ import { parseFormData } from "@/lib/parse-form-data";
import axios from "axios";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function checkTokenGoogle(token: string) {
  return await axios
    .post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    )
    .then((res) => res.data.success);
}

export async function contactUs(formData: FormData) {
  const parsedFormData = parseFormData(formData);

  const token = parsedFormData["g-recaptcha-response"];

  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  );

  const isValid = response.data.success;

  if (!isValid) redirect("/contact?error=invalid-captcha");

  const schema = z.object({
    name: z.string().min(3).max(50),
    email: z.string().email(),
    message: z.string().min(10).max(500),
    phone: z.string().optional().nullable(),
  });

  const { error, data } = schema.safeParse(parsedFormData);

  if (error) redirect("/contact?error=invalid-data");

  try {
    await sendEmailTransport({
      from: process.env.NODEMAILER_EMAIL,
      to: "info@medimun.org",
      subject: `Contact Us Form [${data.email}]`,
      replyTo: data.email,
      text: `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`,
    });
  } catch (e) {
    redirect("/contact?error=failed-to-send-email");
  }
  redirect("/contact?success=true");

  /* const token = formData.get("token");
	const captcha = await verifyServerCaptcha(token);
	if (!captcha) return { ok: false, error: "Failed Captcha", title: "Failed Captcha", variant: "destructive" };
	const name = formData.get("name");
	const email = formData.get("email");
	const message = formData.get("message");
	if (!name || !email || !message)
		return { ok: false, error: "Please fill out all fields", title: "Please fill out all fields", variant: "destructive" };
	return {
		ok: true,
		title: "Message not sent",
		description: "This service isn't running yet, please email us at info@medimun.org",
		variant: "default",
	}; */
  //return { ok: true, title: "Message Sent", description: "We will be in touch soon", variant: "default" };
}
