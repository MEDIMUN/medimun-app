import { sendEmail } from "./main";
import { EmailVerification } from "./templates/email-verification";
import { RejectChairApplication } from "./templates/reject-school-director-application";
import { AcceptChairApplication } from "./templates/accept-school-director-application";
import { ReceivedSchoolDirectorApplicationTemplate } from "./templates/received-school-director-application";
import { ResetPasswordEmailTemplate } from "./templates/reset-password";
import { PasswordChangedNotification } from "./templates/password-changed-notification";
import { AssignCountriesToSchool } from "./templates/assign-countries-to-school";
import { AssignDelegateToCommittee } from "./templates/assign-delegate-to-committee";
import { SchoolReceiveInvoice } from "./templates/new-invoice-to-school";
import { YourDelegatesAssignedToTheirCommittees } from "./templates/your-delegates-assigned-to-their-committees";

export async function sendEmailVerificationEmail({ email, officialName, code }) {
	return sendEmail({
		to: email,
		title: "Verify Your Email",
		subject: "Verify Your Email - MEDIMUN",
		preview: `Dear ${officialName}, please use the code ${code} to complete sign up.`,
		html: <EmailVerification officialName={officialName} code={code} />,
	});
}

export async function sendEmailRejectSchoolDirectorApplication({
	email,
	officialName,
	officialSurname,
	applicationId,
}: {
	email: string;
	officialName: string;
	officialSurname: string;
	applicationId: string;
}) {
	return sendEmail({
		to: email,
		subject: "School Director Application Status - MEDIMUN",
		preview: `Dear ${officialName}, your application has been rejected.`,
		html: <RejectChairApplication officialName={officialName} officialSurname={officialSurname} applicationId={applicationId} />,
		hideFooter: true,
	});
}

export async function sendEmailAcceptSchoolDirectorApplication({
	email,
	officialName,
	officialSurname,
	applicationId,
}: {
	email: string;
	officialName: string;
	officialSurname: string;
	applicationId: string;
}) {
	return sendEmail({
		to: email,
		subject: "School Director Application Status - MEDIMUN",
		preview: `Dear ${officialName}, your application has been accepted.`,
		html: <AcceptChairApplication officialName={officialName} officialSurname={officialSurname} applicationId={applicationId} />,
		hideFooter: true,
	});
}

export async function sendEmailReceivedSchoolDirectorApplication({
	officialName,
	officialSurname,
	email,
	applicationId,
	schoolName,
}: {
	officialName: string;
	officialSurname: string;
	email: string;
	applicationId: string;
	schoolName: string;
}) {
	return sendEmail({
		to: email,
		subject: "School Director Application Received - MEDIMUN",
		preview: `Dear ${officialName}, your application has been received.`,
		html: (
			<ReceivedSchoolDirectorApplicationTemplate
				officialName={officialName}
				officialSurname={officialSurname}
				applicationId={applicationId}
				schoolName={schoolName}
			/>
		),
	});
}

export async function sendEmailResetPassword({
	officialName,
	passwordResetLink,
	email,
}: {
	officialName: string;
	passwordResetLink: string;
	email: string;
}) {
	return sendEmail({
		to: email,
		hideFooter: true,
		subject: "Reset Your Password - MEDIMUN",
		preview: `Dear ${officialName}, reset your password using the following link....`,
		html: <ResetPasswordEmailTemplate officialName={officialName} passwordResetLink={passwordResetLink} />,
	});
}

export async function sendEmailPasswordChangedNotification({ officialName, email }: { officialName: string; email: string }) {
	return sendEmail({
		to: email,
		hideFooter: true,
		subject: "Security Notification - MEDIMUN",
		preview: `Dear ${officialName}, your password was recently changed.`,
		html: <PasswordChangedNotification officialName={officialName} />,
	});
}

export async function sendEmailSchoolHasBeenAssignedCountries({
	officialName,
	email,
	delegationLink,
}: {
	officialName: string;
	email: string;
	delegationLink: string;
}) {
	return await sendEmail({
		to: email,
		subject: "School Country Assignment - MEDIMUN",
		preview: `Dear ${officialName}, your school has been assigned countries.`,
		html: <AssignCountriesToSchool delegationLink={delegationLink} officialName={officialName} />,
	});
}

export async function sendEmailAssignDelegateToCommittee({
	officialName,
	email,
	committeeName,
	country,
}: {
	officialName: string;
	email: string;
	committeeName: string;
	country: string | null;
}) {
	return sendEmail({
		to: email,
		subject: `Welcome to ${committeeName} - MEDIMUN`,
		preview: `Dear ${officialName}, go to MediBook to check out your committee.`,
		html: <AssignDelegateToCommittee country={country} officialName={officialName} committeeName={committeeName} />,
	});
}

export async function sendEmailSchoolInvoice({ officialName, email, schoolName }: { officialName: string; email: string; schoolName: string }) {
	return await sendEmail({
		to: email,
		hideFooter: true,
		subject: `New School Invoice - MEDIMUN`,
		preview: `Dear ${officialName}, go to MediBook to view your school's invoice.`,
		html: <SchoolReceiveInvoice officialName={officialName} schoolName={schoolName} />,
	});
}

export async function sendEmailYourDelegatesHaveBeenAssigned({
	officialName,
	email,
	schoolName,
}: {
	officialName: string;
	email: string;
	schoolName: string;
}) {
	return sendEmail({
		to: email,
		hideFooter: true,
		subject: `Delegates Assigned - MEDIMUN`,
		preview: `Dear ${officialName}, your delegates have been assigned to their committees.`,
		html: <YourDelegatesAssignedToTheirCommittees officialName={officialName} schoolName={schoolName} />,
	});
}
