import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column } from "@react-email/components";

export function AssignCountriesToSchool({ officialName, delegationLink }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Dear {officialName},
					<br />
					<br />
					Your school has been assigned countries for the upcoming conference session. You can view your assigned countries and assign delegates by
					visiting the "My Delegation" page (the page on which you completed the previous stage of the application) or by clicking the link below.
					<br />
					<br />
					<Link href={delegationLink}>My Delegation</Link>
					<br />
					<br />
					The next step is to assign delegates. For this, all delegates must have an account on MediBook. If they do not have one, they can create an
					account by visiting <Link href="https://www.medimun.org/signup">www.medimun.org/signup</Link>.
					<br />
					<br />
					Any school director from your institution can assign delegates. If you have any questions or need assistance, please feel free to contact
					us.
				</Text>
			</Column>
		</Row>
	);
}
