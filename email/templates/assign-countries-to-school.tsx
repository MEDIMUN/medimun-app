import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column } from "@react-email/components";

export function AssignCountriesToSchool({ officialName }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Your school has been assigned countries for the upcoming conference session. You can view your assigned countries by visiting the same page
					you used to select countries or by clicking the link below:
					<br />
					<br />
					<Link href="https://www.medimun.org/medibook">My Delegation</Link>
					<br />
					<br />
					The next step is to assign delegates. For this, all delegates must have an account on MediBook. If they do not have one, they can create an
					account by visiting <Link href="https://www.medimun.org/signup">www.medimun.org/signup</Link>. Delegate assignments can be made on the same
					page you used to select countries, which is also accessible at the link above.
					<br />
					<br />
					Any school director from your institution can assign delegates. If you have any questions or need assistance, please feel free to contact
					us.
				</Text>
			</Column>
		</Row>
	);
}
