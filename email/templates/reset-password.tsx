import sendEmail from "../transporter";
import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, render } from "@react-email/components";

export function ResetPasswordEmailTemplate({ officialName, passwordResetLink }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Dear {officialName},
					<br />
					<br />
					You have requested to reset your password. Please click the link below to reset your password.
					<br />
					<br />
					<Link href={passwordResetLink}>Reset Password</Link>
					<br />
					<br />
					The link will expire in 24 hours.
					<br />
					<br />
					<span className="text-xs">If you did not request to reset your password, please ignore this email.</span>
				</Text>
			</Column>
		</Row>
	);
}
