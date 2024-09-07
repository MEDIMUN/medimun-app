import { Text, Row, Column } from "@react-email/components";

export function EmailVerification({ code, officialName }) {
	return (
		<>
			<Row>
				<Column>
					<Text className="mt-0 text-[15px]">
						Dear {officialName},
						<br />
						<br />
						Thanks for signing up. We're excited to have you on board. To complete your registration, please enter the code below.
					</Text>
				</Column>
			</Row>
			<Row>
				<Column>
					<Text className="text-brand text-[50px] font-light">{code}</Text>
				</Column>
			</Row>
			<Row>
				<Column>
					<Text className="text-[15px] text-[#231F20]">The code will expire in 10 minutes.</Text>
				</Column>
			</Row>
		</>
	);
}
