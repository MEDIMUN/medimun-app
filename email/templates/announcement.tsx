import sendEmail from "../transporter";
import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, render, Markdown } from "@react-email/components";

export function Announcement({ name, markdown, title }) {
	return (
		<Row>
			<Column>
				<Row className="text-[14px]">
					Dear {name},
					<br />
					{title && <>{title}</>}
					<Markdown>{markdown}</Markdown>
					<br />
					<br />
					<span className="text-xs">You can also view this announcement on MediBook.</span>
				</Row>
			</Column>
		</Row>
	);
}
