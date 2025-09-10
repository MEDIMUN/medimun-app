import { auth } from "@/auth";
import { connection } from "next/server";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { CertificateDisplay } from "@/components/certificate-display";
import { Topbar } from "../../server-components";

export default async function Page(props) {
	await connection();
	const params = await props.params;
	const { certificateId } = params;
	const authSession = await auth();

	const selectedCertificate = await prisma.participationCertificate
		.findUniqueOrThrow({
			where: { id: certificateId, session: { publishCertificates: true } },
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
			<Topbar buttonHref={`/verify`} buttonText={`Certificate Verification`} title={"Certificate of Participation"} />
			<div className="max-w-7xl px-4 mx-auto mb-10 font-[Montserrat]!">
				<CertificateDisplay voidMessage={selectedCertificate.voidMessage} isVoid={selectedCertificate.isVoid} certificateId={certificateId} />
			</div>
		</>
	);
}
