import { auth } from "@/auth";
import { MainWrapper } from "@/components/main-wrapper";
import { TopBar } from "@/components/top-bar";
import { connection } from "next/server";
import { CertificateDisplay } from "@/components/certificate-display";
import { DownloadButton } from "@/components/ui/download-button";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { romanize } from "@/lib/romanize";
import { authorize, s } from "@/lib/authorize";
import { SearchParamsButton } from "../../../client-components";

export default async function Page(props) {
	await connection();
	const { certificateId } = await props.params;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!authSession) notFound();

	const selectedCertificate = await prisma.participationCertificate
		.findUniqueOrThrow({
			where: { id: certificateId, session: { publishCertificates: true } },
			include: {
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
			<TopBar hideSearchBar buttonHref="/medibook/certificates" buttonText="Certificates & Awards" title="Certificate of Participation">
				<DownloadButton
					filename={`${authSession.user.officialName} ${authSession.user.officialSurname} | MEDIMUN ${romanize(selectedCertificate.session.numberInteger)} (${selectedCertificate.id})`}
					href={`/api/certificates/${certificateId}`}>
					Download
				</DownloadButton>
				{isManagement && <SearchParamsButton searchParams={{ "edit-participation-certificate": certificateId }}>Edit Certificate</SearchParamsButton>}
			</TopBar>
			<MainWrapper>
				<CertificateDisplay voidMessage={selectedCertificate.voidMessage} isVoid={selectedCertificate.isVoid} certificateId={certificateId} />
			</MainWrapper>
		</>
	);
}
