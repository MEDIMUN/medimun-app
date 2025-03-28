import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { ModalCreateCertificates, ModalDeleteCertificate } from "./modals";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";

export default async function Modals(props) {
	const searchParams = await props.searchParams;
	const page = Number(searchParams.directorspage) || 1;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return;

	if (searchParams["edit-participation-certificate"]) {
		const selectedCertificate = await prisma.participationCertificate
			.findUnique({
				where: { id: searchParams["edit-participation-certificate"] },
				include: {
					session: {
						select: {
							secretaryGeneral: {
								select: {
									user: {
										select: {
											officialName: true,
											officialSurname: true,
											displayName: true,
											id: true,
										},
									},
								},
							},
						},
					},
				},
			})
			.catch(notFound);

		if (!selectedCertificate) {
			return null;
		}

		const seniorDirectors = await prisma.seniorDirector.findMany({
			select: {
				user: {
					select: {
						officialName: true,
						officialSurname: true,
						displayName: true,
						id: true,
					},
				},
			},
			orderBy: {
				user: {
					officialName: "asc",
				},
			},
			take: 10,
			skip: (page - 1) * 10,
		});

		const totalSeniorDirectors = await prisma.seniorDirector.count();
		const seniorDirectorUsers = seniorDirectors.map((seniorDirector) => seniorDirector.user);
		const secretaryGeneralUser = selectedCertificate?.session.secretaryGeneral[0].user;
		const sessionWithOutSecretaryGeneral = { ...selectedCertificate?.session };
		delete (sessionWithOutSecretaryGeneral as { secretaryGeneral?: unknown }).secretaryGeneral;

		if (!seniorDirectorUsers.length) {
			return null;
		}

		return <ModalCreateCertificates selectedCertificate={selectedCertificate} totalSeniorDirectors={totalSeniorDirectors} seniorDirectorUsers={seniorDirectorUsers} secretaryGeneralUser={secretaryGeneralUser} />;
	}

	if (searchParams["delete-participation-certificate"]) {
		//check if cert exists and user management

		const selectedCertificate = await prisma.participationCertificate
			.findFirst({
				where: { id: searchParams["delete-participation-certificate"] },
				include: {
					session: {
						select: {
							secretaryGeneral: {
								select: {
									user: {
										select: {
											officialName: true,
											officialSurname: true,
											displayName: true,
											id: true,
										},
									},
								},
							},
						},
					},
				},
			})
			.catch(notFound);

		if (!selectedCertificate) {
			return null;
		}

		return <ModalDeleteCertificate certificateId={selectedCertificate.id} />;
	}

	return;
}
