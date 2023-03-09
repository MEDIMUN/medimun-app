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
import { Button } from "@chakra-ui/react";
import { Fragment } from "react";

function But() {
	const html = render(<EmailExport />, {
		pretty: true,
	});
}

let name;

export default function EmailExport() {
	const baseUrl = "http://localhost:3000/";

	return (
		<Fragment>
			<Html>
				<Head />
				<Preview>VERIFY YOUR EMAIL | MEDIMUN</Preview>
				<Section style={main}>
					<Container style={container}>
						<Section>
							<Section style={headerBlue}>
								<Img
									src={`${baseUrl}email/google-play-header.png`}
									width="305"
									height="28"
									alt="Google Play developers header blue transparent"
								/>
							</Section>
							<Section style={sectionLogo}>
								<Img src={`${baseUrl}logos/logo-blue.svg`} width="155" height="31" alt="Google Play" />
							</Section>
						</Section>

						<Section style={paragraphContent}>
							<Hr style={hr} />
							<Text style={heading}>VERIFY YOUR EMAIL</Text>
							<Text style={paragraph}>Hello {name},</Text>
							<Text style={paragraph}>We are excited to welcome you to our platform.</Text>
							<Text style={paragraph}>
								You confirm that you agree with our{" "}
								<Link href="https://notifications.google.com" style={link}>
									Privacy Policy & Terms of Service
								</Link>{" "}
								by activating your account. Please note that these terms are subject to change any time.
							</Text>
							<Section style={paragraphList}>
								<Text style={paragraph}>
									If you need any help activating your account, please visit our{" "}
									<Link href="https://notifications.google.com" style={link}>
										Help Centre
									</Link>
									, or{" "}
									<Link href="https://notifications.google.com" style={link}>
										Contact Us.{" "}
									</Link>
									If you've closed the account creation tab in your web browser and are unable to enter the code below,
									please sign up again using the same details. In such cases you will receive a new sign up code.{" "}
								</Text>
							</Section>
							<Section>
								<Section>
									<table style={code}>
										<tr>
											<td style={number}>5</td>
											<td style={number}>5</td>
											<td style={number}>5</td>
											<td style={number}>5</td>
											<td style={number}>5</td>
											<td style={number}>5</td>
										</tr>
									</table>
								</Section>
							</Section>
							<Hr style={hr} />
						</Section>

						<Section style={paragraphContent}>
							<Text style={paragraph}>Thank you,</Text>
							<Text style={{ ...paragraph, fontSize: "20px" }}>The Accounts Team</Text>
						</Section>

						<Section style={containerContact}>
							<Section
								style={{
									padding: "20px 20px",
								}}>
								<Text style={paragraph}>Connect with us</Text>
								<table>
									<tr>
										<td>
											<Link href="https://notifications.google.com">
												<Img width="28" height="28" src={`${baseUrl}email/google-play-chat.png`} />
											</Link>
										</td>
										<td>
											<Link href="https://notifications.google.com">
												<Img width="28" height="28" src={`${baseUrl}email/google-play-icon.png`} />
											</Link>
										</td>
										<td>
											<Link href="https://notifications.google.com">
												<Img width="28" height="28" src={`${baseUrl}email/google-play-academy.png`} />
											</Link>
										</td>
									</tr>
								</table>
							</Section>
							<Img width="540" height="48" src={`${baseUrl}email/google-play-footer.png`} />
						</Section>

						<Section style={{ ...paragraphContent, paddingBottom: 30 }}>
							<Text
								style={{
									...paragraph,
									fontSize: "12px",
									textAlign: "center",
									margin: 0,
								}}>
								©2006 - 2023 Mediterranean Model United Nations {"(MEDIMUN)"}.
							</Text>
							<Text
								style={{
									...paragraph,
									fontSize: "12px",
									textAlign: "center",
									margin: 0,
								}}>
								If you are not the intended receiver of this email, please delete it.
							</Text>
						</Section>
					</Container>
				</Section>
			</Html>
			<Button onClick={But}></Button>
		</Fragment>
	);
}

const fontFamily =
	'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';

const main = {
	backgroundColor: "#dbddde",
};

const sectionLogo = {
	padding: "0 40px",
};

const code = {
	display: "flex",
	flexDirection: "row",
	justifyContent: "center",
	textAlign: "center",
};

const number = {
	textAlign: "center",
	fontSize: "4rem",
	fontWeight: "700",
	color: "#3c4043",
	width: "60px",
	height: "80px",
	margin: "50px",
	backgroundColor: "#f0fcff",
	borderRadius: "10px",
};

const headerBlue = {
	display: "flex",
	justifyContent: "end",
	marginTop: -1,
	marginRight: -2,
	overflow: "hidden",
};

const container = {
	margin: "30px auto",
	width: "610px",
	backgroundColor: "#fff",
	borderRadius: 5,
	overflow: "hidden",
};

const containerContact = {
	backgroundColor: "#f0fcff",
	width: "90%",
	borderRadius: "5px",
	overflow: "hidden",
	marginBottom: 20,
};

const heading = {
	fontFamily,
	fontSize: "14px",
	lineHeight: "26px",
	fontWeight: "700",
	color: "#004dcf",
};

const paragraphContent = {
	padding: "0 40px",
};

const paragraphList = {
	paddingLeft: 40,
};

const paragraph = {
	fontFamily,
	fontSize: "14px",
	lineHeight: "22px",
	color: "#3c4043",
};

const link = {
	...paragraph,
	color: "#004dcf",
};

const hr = {
	borderColor: "#e8eaed",
	margin: "20px 0",
};

export const html = render(<EmailExport />, {
	pretty: true,
});
