import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { ModalInviteCoSubmitter } from "./modalInviteCoSubmitter";
import { ModalLeaveAsCoSubmitter } from "./modalLeaveAsCoSubmitter";
import { ModalTransferMainSubmitter } from "./modalMakeTransferSubmitter";

export default async function Modals(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;

	const authSession = await auth();
	if (!authSession) return null;

	if (searchParams["invite-co-submitter"]) {
		const selectedResolution = await prisma.resolution.findUnique({
			where: {
				id: searchParams["invite-co-submitter"],
				status: "DRAFT",
				mainSubmitter: { userId: authSession.user.id },
			},
			include: {
				topic: true,
				mainSubmitter: { include: { user: true } },
				committee: { include: { Topic: true } },
				CoSubmitters: { include: { delegate: { include: { user: true } } } },
				CoSubmitterInvitation: true,
			},
		});

		if (!selectedResolution) return null;

		const applicableCommitteeDelegates = await prisma.delegate.findMany({
			where: {
				committeeId: selectedResolution.committeeId,
				userId: { not: authSession.user.id },
				CoSubmitterInvitation: {
					none: { resolutionId: selectedResolution.id },
				},
			},
			include: { user: true },
		});

		if (selectedResolution.CoSubmitters.length + selectedResolution.CoSubmitterInvitation.length >= 15) {
			return null;
		}

		return <ModalInviteCoSubmitter applicableCommitteeDelegates={applicableCommitteeDelegates} selectedResolution={selectedResolution} />;
	}

	if (searchParams["leave-co-submitter"]) {
		const selectedResolution = await prisma.resolution.findUnique({
			where: {
				id: searchParams["leave-co-submitter"],
				status: "DRAFT",
				CoSubmitters: { some: { delegate: { userId: authSession.user.id } } },
			},
			include: {
				topic: true,
				mainSubmitter: { include: { user: true } },
				committee: { include: { Topic: true } },
				CoSubmitters: { include: { delegate: { include: { user: true } } } },
				CoSubmitterInvitation: true,
			},
		});

		if (!selectedResolution) return null;

		return <ModalLeaveAsCoSubmitter selectedResolution={selectedResolution} />;
	}

	if (searchParams["transfer-main-submitter"] && searchParams["co-submitter-id"]) {
		const selectedResolution = await prisma.resolution.findUnique({
			where: {
				id: searchParams["transfer-main-submitter"],
				status: "DRAFT",
				mainSubmitter: { userId: authSession.user.id },
				CoSubmitters: { some: { delegateId: searchParams["co-submitter-id"] } },
			},
			include: {
				topic: true,
				mainSubmitter: { include: { user: true } },
				committee: { include: { Topic: true } },
				CoSubmitters: { include: { delegate: { include: { user: true } } } },
				CoSubmitterInvitation: true,
			},
		});

		if (!selectedResolution) return null;

		if (selectedResolution.CoSubmitters.length + selectedResolution.CoSubmitterInvitation.length >= 15) return null;

		return <ModalTransferMainSubmitter selectedResolution={selectedResolution} />;
	}

	return null;
}
