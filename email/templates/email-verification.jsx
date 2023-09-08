import sendEmail from "../transporter";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Hr } from "@react-email/hr";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { render } from "@react-email/render";
import { Fragment } from "react";
import { Row } from "@react-email/row";
import { Column } from "@react-email/column";
import { Tailwind } from "@react-email/tailwind";
import MainTemplate from "./main";

function EmailVerification(props) {
	const baseUrl = "https://www.medimun.org";

	return (
		<MainTemplate title="VERIFY YOUR EMAIL">
			<Row className="p-0">
				<Column style={rightStyle}></Column>
				<Column>
					<Text className="mt-0 font-['Montserrat'] text-[15px]">DEAR {props.name.toUpperCase()}</Text>
					<Text className="font-['Montserrat'] text-[15px] text-[#231F20]">
						THANKS FOR CREATING AN ACCOUNT
						<br />
						PLEASE ENTER THE CODE BELOW TO
						<br />
						COMPLETE SIGN UP
					</Text>
				</Column>
				<Column className="w-8 bg-[#D7D3D1]" />
			</Row>
			<Row>
				<Column className="w-8" />
				<Column>
					<Text className="text-brand font-['Montserrat'] text-[50px]">{props.code}</Text>
				</Column>
				<Column className="w-8 bg-[#D7D3D1]" />
			</Row>
			<Row>
				<Column className="w-8" />
				<Column>
					<Text className="font-['Montserrat'] text-[15px] text-[#231F20]">THE CODE WILL EXPIRE IN 10 MINUTES</Text>
				</Column>
				<Column className="bg-[#D7D3D1]" style={rightStyle}></Column>
			</Row>
		</MainTemplate>
	);
}

const rightStyle = {
	width: "32px",
	minWidth: "32px",
	maxWidth: "32px",
};

const container = {
	margin: "30px auto",
	width: "700px",
	backgroundColor: "#fff",
	borderRadius: 5,
	overflow: "hidden",
};

export default async function sendVerificationEmail(name, email, code) {
	await sendEmail(
		"MEDIMUN <notifications@medimun.org>",
		email,
		"Verify your email",
		render(<EmailVerification name={name} code={code} />, {
			pretty: true,
		})
	);
}
