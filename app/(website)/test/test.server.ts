"use server";

import { sendEmailAcceptSchoolDirectorApplication, sendEmailRejectSchoolDirectorApplication, sendEmailVerificationEmail } from "@/email/send";

export async function TestAction() {
	await sendEmailVerificationEmail({ officialName: "Berzan", email: "berzanozejder@gmail.com", code: "313131" });
	await sendEmailRejectSchoolDirectorApplication({
		officialName: "Berzan",
		officialSurname: "Ozejder",
		email: "berzanozejder@gmail.com",
		applicationId: "313131",
	});
	await sendEmailAcceptSchoolDirectorApplication({
		officialName: "Berzan",
		officialSurname: "Ozejder",
		email: "berzanozejder@gmail.com",
		applicationId: "313131",
	});
}
