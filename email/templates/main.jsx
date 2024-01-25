import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Hr } from "@react-email/hr";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { Row } from "@react-email/row";
import { Column } from "@react-email/column";
import { Tailwind } from "@react-email/tailwind";

export default function MainTemplate(props) {
	const baseUrl = "https://www.medimun.org";

	return (
		<Tailwind
			config={{
				theme: {
					extend: {
						colors: {
							brand: "#AE2D28",
							secondary: "#9E2723",
						},
					},
				},
			}}>
			<Html>
				<Head></Head>
				<Preview>Verify Your Email - MEDIMUN</Preview>
				<Section className="mx-auto my-0 bg-gray-400 font-[Helvetica] font-[700] md:my-[30px]">
					<Container style={container}>
						<Section className="bg-brand">
							<Row className="h-8">
								<Column style={rightStyle}></Column>
								<Column className="text-brand">.</Column>
								<Column style={rightStyle} className="bg-secondary" />
							</Row>
							<Row>
								<Column className="w-8" />
								<Column className="ml-8">
									<Img width="180" alt="Logo" title="Logo" style="display:block" src={`${baseUrl}/email/logos/logo-red.png`} />
								</Column>
								<Column></Column>
								<Column className="w-8 bg-[#9E2723]" />
							</Row>
							<Row className="h-12">
								<Column style={rightStyle}></Column>
								<Column className="text-brand">.</Column>
								<Column style={rightStyle} className="bg-secondary" />
							</Row>
							<Row className="bg-primary p-[30px]">
								<Column style={rightStyle}></Column>
								<Column className="text-brand">.</Column>
								<Column style={rightStyle} className="bg-secondary" />
							</Row>
							<Row>
								<Column className="w-8" />
								<Column>
									<Text className="font-['Helvetica'] text-[30px] text-[#440000]">{props.title}</Text>
								</Column>
								<Column className="w-8 bg-secondary" />
							</Row>
							<Row className="h-8">
								<Column style={rightStyle}></Column>
								<Column className="text-brand">.</Column>
								<Column style={rightStyle} className="bg-secondary" />
							</Row>
						</Section>
						<Section className="min-h-[100px] bg-[#EDE7E5]">
							<Row className="min-h-8 h-8">
								<Column style={rightStyle}></Column>
								<Column className="text-[#EDE7E5]">.</Column>
								<Column style={rightStyle} className="bg-[#D7D3D1]" />
							</Row>
							{props.children}
							<Row className="min-h-8 h-8">
								<Column style={rightStyle}></Column>
								<Column className="text-[#EDE7E5]">.</Column>
								<Column style={rightStyle} className="bg-[#D7D3D1]" />
							</Row>
						</Section>
						<Section className="min-h-[100px] bg-[#9C9B9B]">
							<Row className="h-8">
								<Column style={rightStyle}></Column>
								<Column className="text-[#9C9B9B]">.</Column>
								<Column style={rightStyle} className="bg-[#8A8889]" />
							</Row>
							<Row className="mt-0 h-8">
								<Column className="w-8" />
								<Column>
									<Text className="m-0 mt-0 font-['Helvetica'] text-[15px] text-[#231F20]">Mediterranean Model United Nations</Text>
								</Column>
								<Column style={rightStyle} className="w-8 bg-[#8A8889]" />
							</Row>
							<Row className="h-8">
								<Column className="w-8" />
								<Column>
									<Text style="font-family: Helvetica" className="m-0 mt-2 font-['Helvetica'] text-[15px] leading-5 text-[#231F20]">
										The English School,
										<br />
										0 Kyriakou Matsi Avenue
										<br />
										1082 Strovolos, Nicosia, Cyprus
									</Text>
								</Column>
								<Column className="w-8 bg-[#8A8889]" />
							</Row>
							<Row className="mb-0 h-8">
								<Column className="w-8" />
								<Column>
									<Text style="font-family: Helvetica" className="m-0 mt-2 font-['Helvetica'] text-[10px] leading-3 text-[#231F20]">
										This is an automatically generated email.
									</Text>
								</Column>
								<Column className="w-8 bg-[#8A8889]" />
							</Row>
							<Row className="h-8">
								<Column style={rightStyle}></Column>
								<Column className="text-[#9C9B9B]">.</Column>
								<Column style={rightStyle} className="bg-[#8A8889]" />
							</Row>
						</Section>
						<Section className="bg-[#787777]">
							<Row className="max-h-8">
								<Column className="max-h-8 text-[#787777]">.</Column>
								<Column style={rightStyle} className="bg-[#656465]" />
							</Row>
						</Section>
					</Container>
				</Section>
			</Html>
		</Tailwind>
	);
}

const container = {
	margin: "30px auto",
	width: "700px",
	backgroundColor: "#fff",
	borderRadius: 5,
	overflow: "hidden",
};

const rightStyle = {
	width: "32px",
	height: "32px",
	maxHeight: "32px",
	minHeight: "32px",
	minWidth: "32px",
	maxWidth: "32px",
};
