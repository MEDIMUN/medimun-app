import sendEmail from "../transporter";
import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, render } from "@react-email/components";

export function YourDelegatesAssignedToTheirCommittees({ officialName, schoolName }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Dear {officialName},
					<br />
					<br />
					We are pleased to inform you that the students from {schoolName} have been successfully assigned to their committees.
					<br />
					<br />
					Please remind your students to actively check MediBook for important updates and announcements. They should stay informed by visiting:
					<ul>
						<li>
							<strong>Session Announcements</strong> for specific session details.
						</li>
						<li>
							<strong>Global Announcements</strong> for broader conference updates.
						</li>
						<li>
							<strong>Committee Announcements</strong> for committee-specific news.
						</li>
					</ul>
					<br />
					Encourage your students to explore <strong>session, global, and committee resources</strong> on MediBook so they can find useful materials
					for their preparation. MediBook will help them connect with their committee fellows, reach out to their chairs, and access tools such as
					live voting, messaging, and other essential features.
					<br />
					<br />
					Students will also receive their certificates on MediBook once the conference concludes, making it an integral platform for their
					participation.
					<br />
					<br />
					Thank you for your support, and please feel free to contact us if you have any questions or need assistance.
				</Text>
			</Column>
		</Row>
	);
}
