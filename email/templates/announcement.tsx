import sendEmail from "../transporter";
import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, render, Markdown } from "@react-email/components";

export function Announcement({ name, markdown, title }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Dear {name},
					<br />
					{title && (
						<>
							{title}
							<br />
							<br />
						</>
					)}
					<Markdown>{markdown}</Markdown>
					<br />
					<br />
					<span className="text-xs">You can also view this announcement on MediBook.</span>
				</Text>
			</Column>
		</Row>
	);
}
