import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { ModalCreateCertificates } from "./modal-create-certificates";

export default async function Modals(props) {
	const { sessionNumber } = await props.params;
	const searchParams = await props.searchParams;
	const page = Number(searchParams.page) || 1;

	if (searchParams["create-participation-certificates"]) {
		const selectedSession = await prisma.session
			.findUniqueOrThrow({
				where: { number: sessionNumber },
				include: {
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
			})
			.catch(notFound);

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
		const secretaryGeneralUser = selectedSession.secretaryGeneral[0]?.user;
		const sessionWithOutSecretaryGeneral = { ...selectedSession };
		delete (sessionWithOutSecretaryGeneral as { secretaryGeneral?: unknown }).secretaryGeneral;

		if (!seniorDirectorUsers.length || !secretaryGeneralUser) {
			return null;
		}
		return <ModalCreateCertificates totalSeniorDirectors={totalSeniorDirectors} selectedSession={sessionWithOutSecretaryGeneral} seniorDirectorUsers={seniorDirectorUsers} secretaryGeneralUser={secretaryGeneralUser} />;
	}
	return;
}
