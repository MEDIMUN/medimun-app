import { Link, Text, Row, Column } from "@react-email/components";

export function TemplateReceiveNewCertificate({ officialName }) {
	return (
		<Row>
			<Column>
				<Text className="mt-0 text-[15px]">
					Dear {officialName},
					<br />
					<br />
					We are pleased to inform you that a new certificate has been issued in your name. You may view and download it by visiting your{" "}
					<Link href="https://www.medimun.org/medibook/certificates">MediBook certificates page</Link>.
					<br />
					<br />
					In addition, you will find all certificates from your previous participation sessions conveniently archived on the same page for your reference.
					<br />
					<br />
					Should you have any questions or require further assistance, please do not hesitate to reach out to us. We remain at your disposal.
				</Text>
			</Column>
		</Row>
	);
}
