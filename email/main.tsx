import { Head, Hr, Html, Img, Link, Preview, Section, Text, Row, Column, Tailwind, Container, Heading } from "@react-email/components";
import { render } from "@react-email/render";
import sendEmailTransport from "./transporter";

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
			<Head />
			<Preview>{props.preview}</Preview>
			<Html className="font-arial bg-white">
				<Section className="mt-[40px] rounded-b-lg bg-zinc-100 px-[32px] py-[40px]">
					<Row>
						<Column className="w-[80%]">
							<Img alt="MEDIMUN Logo" height="42" src={`${baseUrl}/assets/branding/logos/logo-white-email.png`} />
						</Column>
						<Column align="right">
							<Row align="right">
								<Column className="px-[8px]">
									<Link className="text-gray-600 [text-decoration:none]" href="https://www.medimun.org/">
										Home
									</Link>
								</Column>
								<Column className="px-[8px]">
									<Link className="text-gray-600 [text-decoration:none]" href="https://www.medimun.org/about">
										About
									</Link>
								</Column>
								<Column className="px-[8px]">
									<Link className="text-gray-600 [text-decoration:none]" href="https://www.medimun.org/medibook">
										MediBook
									</Link>
								</Column>
							</Row>
						</Column>
					</Row>
				</Section>
				<Hr className="my-[16px] border-t-2 bg-zinc-100" />
				{props.title && (
					<>
						<Section className="rounded-lg bg-zinc-100 px-[40px]">
							<Heading className="!font-extralight">{props.title}</Heading>
						</Section>
						<Hr className="my-[16px] border-t-2 bg-zinc-100" />
					</>
				)}
				<Section className="rounded-lg bg-zinc-100 px-[40px] py-[16px] font-extralight">{props.children}</Section>
				<Hr className="my-[16px] border-t-2 bg-zinc-100" />
				{!props.hideAd && (
					<>
						<Section className="rounded-lg bg-zinc-100 px-[40px] py-[16px]">
							<Section>
								<Row>
									<Text className="mt-[8px] text-[16px] font-thin leading-[24px] text-zinc-800">
										We are a UN Simulation for teens aged 15 to 19, where students represent assigned countries. They research their nation's policies
										to draft and debate resolutions on global issues. <Link href="https://www.medimun.org">Learn more.</Link>
									</Text>
								</Row>
							</Section>
							<Section className="max-w-full">
								<Row className="mt-[16px]">
									<Column className="w-1/2 pr-[8px]">
										<Row className="pb-2">
											<td>
												<Link href="#">
													<Img
														alt="Delegates Picture"
														className="w-full rounded-[12px] object-cover shadow-md"
														height={152}
														src={`${baseUrl}/assets/committee-1.jpg`}
													/>
												</Link>
											</td>
										</Row>
										<Row className="pt-2">
											<td>
												<Link href="#">
													<Img
														alt="Delegates Picture"
														className="w-full rounded-[12px] object-cover shadow-md"
														height={152}
														src={`${baseUrl}/placeholders/delegates-3.jpg`}
													/>
												</Link>
											</td>
										</Row>
									</Column>
									<Column className="w-1/2 py-[8px] pl-[8px]">
										<Link href="#">
											<Img
												alt="Delegates Picture"
												className="w-full rounded-[12px] object-cover shadow-md"
												height={152 + 152 + 8 + 8}
												src={`${baseUrl}/placeholders/delegates-2.jpg`}
											/>
										</Link>
									</Column>
								</Row>
							</Section>
						</Section>
						<Hr className="my-[16px] border-t-2 bg-zinc-100" />
					</>
				)}
				<Section className="rounded-t-lg bg-zinc-100 p-[40px]">
					<Row>
						<Column colSpan={4}>
							<Img alt="MEDIMUN Mini Logo" className="rounded-full shadow-md" height="42" src={`${baseUrl}/email/logos/logo-mini.png`} />
							<Text className="my-[8px] text-[16px] font-light leading-[24px] text-gray-900">Mediterranean Model United Nations</Text>
							<Text className="mt-[4px] text-[10px] leading-[24px] text-gray-500">We are affiliated with the THIMUN Foundation.</Text>
						</Column>
					</Row>
				</Section>
			</Html>
		</Tailwind>
	);
}

export async function sendEmail({
	to,
	bcc,
	subject,
	title,
	replyTo = "medimun.cyprus@gmail.com",
	html,
	preview,
	hideFooter = false,
}: {
	to: string;
	bcc?: string;
	subject: string;
	title?: string;
	replyTo?: string;
	html: JSX.Element;
	preview: string;
	hideFooter?: boolean;
}) {
	let processedHtml;
	try {
		processedHtml = await render(
			<MainTemplate hideAd={hideFooter} title={title} preview={preview}>
				{html}
			</MainTemplate>,
			{ pretty: true }
		);
	} catch (error) {}

	return sendEmailTransport({
		to,
		bcc,
		replyTo,
		html: processedHtml,
		subject: subject,
		text: preview,
	});
}
