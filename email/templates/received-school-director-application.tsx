import sendEmail from "../transporter";
import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, render } from "@react-email/components";

export function ReceivedSchoolDirectorApplicationTemplate({ applicationId, officialName, officialSurname, schoolName }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Dear {officialName} {officialSurname},
					<br />
					<br />
					We have received your application for the position of School Director for {schoolName}.
					<br />
					<br />
					We will review your application and get back to you as soon as possible. You can check the status of your application at any time by
					visiting the applications page on MediBook where you have applied. You will also receive an email notification when your application has
					been reviewed.
					<br />
					<br />
					If you have any questions, please do not hesitate to contact us at{" "}
					<Link href="mailto:medimun.cyprus@gmail.com">medimun.cyprus@gmail.com</Link>.
					<br />
					<br />
					<span className="text-xs">Your application ID is {applicationId}.</span>
				</Text>
			</Column>
		</Row>
	);
}
