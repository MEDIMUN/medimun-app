import { auth } from "@/auth";
import { MainWrapper } from "@/components/main-wrapper";
import { TopBar } from "@/components/top-bar";
import { connection } from "next/server";
import { DownloadButton } from "@/components/ui/download-button";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { romanize } from "@/lib/romanize";
import { CertificateDisplay } from "@/components/certificate-display";
import { SearchParamsButton } from "@/app/(medibook)/medibook/client-components";
import { authorize, s } from "@/lib/authorize";
import { Download } from "lucide-react";

export default async function Page(props) {
	await connection();
	const params = await props.params;
	const { certificateId } = params;
	const { sessionNumber } = params;
	const authSession = await auth();
	if (!authSession) notFound();
	const isManagement = authorize(authSession, [s.management]);

	const selectedCertificate = await prisma.participationCertificate
		.findUniqueOrThrow({
			where: { id: certificateId },
			include: {
				user: {
					select: {
						officialName: true,
						officialSurname: true,
						displayName: true,
						id: true,
					},
				},
				session: {
					select: {
						numberInteger: true,
						number: true,
					},
				},
			},
		})
		.catch(notFound);

	return (
		<>
			<TopBar
				hideSearchBar
				buttonHref={`/medibook/sessions/${sessionNumber}/certificates`}
				buttonText={`Session ${romanize(sessionNumber)} Certificates`}
				title={selectedCertificate.user.officialName + " " + selectedCertificate.user.officialSurname + " | Certificate of Participation"}>
				{isManagement && <SearchParamsButton searchParams={{ "edit-participation-certificate": certificateId }}>Edit Certificate</SearchParamsButton>}
				<DownloadButton
					filename={`${selectedCertificate.user.officialName} ${selectedCertificate.user.officialSurname} | MEDIMUN ${romanize(selectedCertificate.session.numberInteger)} (${selectedCertificate.id})`}
					href={`/api/certificates/${certificateId}`}>
					<Download /> Download
				</DownloadButton>
			</TopBar>
			<MainWrapper>
				<CertificateDisplay voidMessage={selectedCertificate.voidMessage} isVoid={selectedCertificate.isVoid} certificateId={certificateId} />
			</MainWrapper>
		</>
	);
}
