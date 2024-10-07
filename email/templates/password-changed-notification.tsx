import sendEmail from "../transporter";
import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, render } from "@react-email/components";

export function PasswordChangedNotification({ officialName }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Dear {officialName},
					<br />
					<br />
					Your password was recently changed. If you did not make this change, please contact us immediately.
					<br />
					<br />
					<Link href={`https://www.medimun.org/contact`}>Contact Us</Link>
					<br />
					<br />
					<span className="text-xs">If you changed your password, you can ignore this email.</span>
				</Text>
			</Column>
		</Row>
	);
}
