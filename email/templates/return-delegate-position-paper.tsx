import sendEmail from "../transporter";
import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, render } from "@react-email/components";

export function ReturnDelegatePositionPaper({ officialName, details }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Dear {officialName},
					<br />
					<br />
					Your position paper has been reviewed by your chairs.
					<br />
					<br />
					{details}
					{details && (
						<>
							<br />
							<br />
						</>
					)}
					Please check <Link href="https://www.medimun.org/medibook">MediBook</Link> for further details.
					<br />
					<br />
					<span className="text-xs">This is an automated email. Please do not reply to this email.</span>
				</Text>
			</Column>
		</Row>
	);
}
