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
	console.log(html);
}

let name;

export default function EmailExport() {
	const baseUrl = "http://localhost:3000/";

	return (
		<Fragment>
			<Html>
				<Head />
				<Preview>We hope this email finds you well...</Preview>
				<Section style={main}>
					<Container style={container}>
						<Section>
							<Section style={headerBlue}>
								<Img
									src={"https://drive.google.com/uc?export=download&id=1-rczL0idM8BXvsRd6VX8-ZdOs219E081"}
									width="600"
									height="28"
									alt="MEDIMUN-Header-Image"
								/>
							</Section>
							<Section style={sectionLogo}>
								<Img
									src={`https://drive.google.com/uc?export=download&id=1ot53n-iwHweLuzoTuT5tIR50piQYMYUI`}
									width="165"
									height="48"
									alt="Google Play"
								/>
							</Section>
						</Section>

						<Section style={paragraphContent}>
							<Hr style={hr} />
							<Text style={heading}>
								Welcome to the 18<sup>th</sup> Annual Session
							</Text>
							<Text style={paragraph}>Dear delegates,</Text>
							<Text style={paragraph}>
								We hope this email finds you well! We are very excited about this year's MediMUN conference and we hope
								that you too are eager to debate and see the results of months of effort pay off!
							</Text>
							<Text style={paragraph}>
								As you all know this year's conference will be at the University of Nicosia on the 3rd and 4th of
								February 2023. Through this link, you can access the{" "}
								<Link href="https://medimun.net/programme/" style={link}>
									Conference Schedule
								</Link>{" "}
								so you can see what is in store for you.
							</Text>
							<Section style={paragraphList}>
								<Text style={title}>How to prepare?</Text>
								<Text style={paragraph}>
									We suggest you take another look at the debate procedure before coming to the conference through this{" "}
									<Link
										href="https://medimun.net/wp-content/uploads/2022/09/Teacher-Workshop-Presentation.pdf"
										style={link}>
										presentation{" "}
									</Link>
									or by reviewing any documents that your chairs have shared with you. Additionally, you can also look
									at the{" "}
									<Link href="https://medimun.net/wp-content/uploads/2022/09/Delegate-Handbook.pdf" style={link}>
										Delegate Handbook
									</Link>{" "}
									for more detailed guidance. Finally, we would also suggest that you go over the research booklets that
									your chairs have prepared so that you are familiar with all the topics that will be debated in your
									conference room. These can be found through this{" "}
									<Link href="https://medimun.net/resources/" style={link}>
										link
									</Link>
									.
								</Text>
								<Text style={title}>What additional things to bring?</Text>
								<Text style={paragraph}>
									- A laptop, tablet or any other digital device that will allow you to quickly access the web during
									lobbying and debating.
									<br />
									- A USB stick with your prepared individual Resolution or your prepared Clauses (SC/HSC).
									<br />- Some pens and highlighters.
									<br />- Some Sticky notes.
								</Text>
								<Text style={title}>Social Media Presence</Text>
								<Text style={paragraph}>
									Finally, this year we are planning to be very active with our social media platforms and we want to
									showcase all your treasured moments so please follow and tag our{" "}
									<Link href="https://instagram.com/medimun.cy?igshid=YmMyMTA2M2Y=" style={link}>
										Instagram Account
									</Link>{" "}
									in your stories.
									<br />
									As always we are at your disposal for any further information, questions or concerns that you may
									have. Please do not hesitate to contact us.
								</Text>
							</Section>
							<Hr style={hr} />
						</Section>

						<Section style={paragraphContent}>
							<Text style={paragraph}>Yours Sincerely,</Text>
							<Text style={{ ...paragraph, fontSize: "20px" }}>The Secretariat</Text>
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
											<Link href="https://instagram.com/medimun.cy?igshid=YmMyMTA2M2Y=">
												<Img
													width="28"
													height="28"
													src={`https://drive.google.com/uc?export=download&id=1GHuPpWNAeBx4mb_dkRr2EEZR5a-WfQIC`}
												/>
											</Link>
										</td>
										<td>
											<Link href="https://www.facebook.com/medimun">
												<Img
													width="28"
													height="28"
													src={`https://drive.google.com/uc?export=download&id=1PpkRHsP3ujgGer8cGC5yGdAsfDVzoTKE`}
												/>
											</Link>
										</td>
										<td>
											<Link href="https://medimun.net">
												<Img
													width="28"
													height="28"
													src={`https://drive.google.com/uc?export=download&id=1tCZjldwOgNSA1D-cCsMjQVBdYloV7EDK`}
												/>
											</Link>
										</td>
									</tr>
								</table>
							</Section>
							<Img
								width="540"
								height="48"
								src={`https://drive.google.com/uc?export=download&id=1urqCH8DbujiTaw1OD9b_V5wBldwScAG8`}
							/>
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

const title = {
	fontFamily,
	fontSize: "14px",
	lineHeight: "26px",
	fontWeight: "700",
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

/* export const html = render(<EmailExport />, {
	pretty: true,
}); */

const html = render(<EmailExport />, {
	pretty: true,
});
console.log(html);
