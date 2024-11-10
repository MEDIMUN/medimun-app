import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, render } from "@react-email/components";

export function AssignDelegateToCommittee({ officialName, country, committeeName }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Dear {officialName},
					<br />
					<br />
					We are delighted to inform you that{" "}
					{country ? (
						<>
							you have been assigned as a delegate of <strong>{country}</strong> in <strong>{committeeName}</strong>.
						</>
					) : (
						<>
							you have been assigned to be a delegate in <strong>The {committeeName}</strong>.
						</>
					)}
					<br />
					<br />
					Welcome to this exciting opportunity to collaborate, debate, and make lasting connections. We encourage you to prepare thoroughly and engage
					actively with your peers.
					<br />
					<br />
					Please make sure to regularly check <Link href="https://www.medimun.org/medibook">MediBook</Link> for:
					<ul>
						<li>
							<strong>Global Announcements</strong> for conference-wide updates.
						</li>
						<li>
							<strong>Session Announcements</strong> for important session-specific information.
						</li>
						<li>
							<strong>Committee Announcements</strong> for committee-specific news and updates.
						</li>
					</ul>
					<br />
					Be sure to explore the <strong>session, global, and committee resources</strong> on MediBook to find useful materials for your preparation.
					You can also meet your fellow delegates, reach out to your committee chair, and utilize tools such as live voting, messaging, and more.
					<br />
					<br />
					After the conference, you will receive your participation certificate on MediBook, so it’s essential to stay connected and engaged.
					<br />
					<br />
					We look forward to seeing you at the conference.
					<br />
					<br />
					<span className="text-xs">Some features are coming soon.</span>
				</Text>
			</Column>
		</Row>
	);
}
