import sendEmail from "../transporter";
import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, render } from "@react-email/components";

export function AcceptChairApplication({ applicationId, officialName, officialSurname }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Dear {officialName} {officialSurname},
					<br />
					<br />
					Thanks for applying as a School Director,
					<br />
					<br />
					We are pleased to inform you that your application has been approved for the current session of the conference.
					<br />
					<br />
					When the next stage of the application process begins for delegates you will be able to access the application form on{" "}
					<Link href="https://www.medimun.org/medibook">MediBook</Link>. Please note that if there are any other school directors from your school,
					they will also need to apply for school director.
					<br />
					<br />
					<span className="text-xs">Your application ID is {applicationId}.</span>
				</Text>
			</Column>
		</Row>
	);
}
