import sendEmail from "../transporter";
import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, Tailwind, Container, render } from "@react-email/components";

export function RejectChairApplication({ applicationId, officialName, officialSurname }) {
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
					Unfortunately, we are unable to approve your application at this time. If you have any questions or would like further clarification, feel
					free to contact us.
					<br />
					<br />
					You are welcome to reapply in the future, and we appreciate your interest and understanding during this process.
					<br />
					<br />
					<span className="text-xs">Your application ID is {applicationId}.</span>
				</Text>
			</Column>
		</Row>
	);
}
