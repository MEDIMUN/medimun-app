import prisma from "@/prisma/client";
import { ModalReturnPositionPaper, ModalSubmitPositionPaper, ModalDeletePositionPaper } from "./modals";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";

export default async function Modals(props) {
	const authSession = await auth();
	if (!authSession) return null;
	const isManagement = authorize(authSession, [s.management]);
	const searchParams = await props.searchParams;
	const params = await props.params;
	const committeeId = params.committeeId;
	const sessionNumber = params.sessionNumber;
	const currentPage = parseInt(searchParams.page) || 1;
	let allResources, totalResources, selectedCommittee, selectedPositionPaper;

	if (searchParams["submit-position-paper"]) {
		allResources = await prisma.resource.findMany({
			where: { userId: authSession.user.id, scope: { hasSome: ["PERSONAL"] } },
			take: 10,
			orderBy: { time: "desc" },
			skip: (currentPage - 1) * 10,
		});
		totalResources = await prisma.resource.count({ where: { userId: authSession.user.id, scope: { hasSome: ["PERSONAL"] } } });
		selectedCommittee = await prisma.committee.findFirst({
			where: {
				OR: [{ slug: committeeId }, { id: committeeId }],
				session: { number: sessionNumber },
			},
		});
	}

	if (searchParams["return-position-paper"]) {
		selectedPositionPaper = await prisma.positionPaper.findFirst({
			where: {
				id: searchParams["return-position-paper"],
			},
			include: {
				committee: true,
			},
		});
		if (!selectedPositionPaper) {
			selectedPositionPaper = null;
			return;
		}
		const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedPositionPaper.committeeId);
		if (!isChairOfCommittee && !isManagement) {
			selectedPositionPaper = null;
		}
		if (selectedPositionPaper.status !== "PENDING") {
			selectedPositionPaper = null;
		}
	}

	if (searchParams["delete-position-paper"]) {
		selectedPositionPaper = await prisma.positionPaper.findFirst({
			where: {
				id: searchParams["delete-position-paper"],
			},
			include: {
				committee: {
					include: {
						session: true,
					},
				},
			},
		});
		const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedPositionPaper.committeeId);
		if (!isChairOfCommittee && !isManagement) {
			selectedPositionPaper = null;
		}
	}

	if (searchParams["delete-position-paper"] && selectedPositionPaper) {
		return <ModalDeletePositionPaper selectedPositionPaper={selectedPositionPaper} />;
	}

	if (searchParams["return-position-paper"] && selectedPositionPaper) {
		return <ModalReturnPositionPaper selectedPositionPaper={selectedPositionPaper} />;
	}

	if (searchParams["submit-position-paper"]) {
		return <ModalSubmitPositionPaper selectedCommittee={selectedCommittee} totalResources={totalResources} allResources={allResources} />;
	}
}
