import prisma from "@/prisma/client";
import { ModalCreateResolution } from "./modalCreateResolution";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "@/lib/authorize";
import { ModalDeleteResolution } from "./modalDeleteResolution";
import { ModalInviteCoSubmitter } from "./modalInviteCoSubmitter";
import { ModalSendToApprovalPanel } from "./modalSendToApprovalPanel";

export default async function Modals(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;

	const authSession = await auth();
	if (!authSession) return null;

	const selectedSession = await prisma.session.findFirst({
		where: { number: params.sessionNumber },
	});

	if (!selectedSession) return null;

	const selectedCommittee = await prisma.committee.findFirst({
		where: { OR: [{ id: params.committeeId }, { slug: params.committeeId }], sessionId: selectedSession.id },
		include: {
			Topic: true,
		},
	});

	if (!selectedCommittee) return null;

	const isManagement = authorize(authSession, [s.management]);
	const isChair = authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isDelegate = authorizeDelegateCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isSessionCurrent = selectedSession.isCurrent;

	if (searchParams["add-committee-resolution"]) {
		const isAllowedToAddResolution = (isChair || isDelegate) && isSessionCurrent;
		if (!isAllowedToAddResolution) return null;
		const resourcesOfUser = await prisma.resource.findMany({
			where: { userId: authSession.user.id },
		});
		return <ModalCreateResolution selectedCommittee={selectedCommittee} resourcesOfUser={resourcesOfUser} />;
	}

	if (searchParams["delete-committee-resolution"]) {
		const selectedResolution = await prisma.resolution.findUnique({
			where: {
				id: searchParams["delete-committee-resolution"],
			},
			include: {
				mainSubmitter: true,
			},
		});

		if (isDelegate && !isChair && !isManagement && selectedResolution?.status === "DRAFT") {
			if (selectedResolution.mainSubmitter.userId === authSession.user.id) {
				return <ModalDeleteResolution selectedResolution={selectedResolution} />;
			}
		}

		if (
			isChair &&
			!isManagement &&
			!!selectedResolution &&
			["DRAFT", "SENT_BACK_TO_COMMITTEE", "SENT_TO_CHAIRS", "IN_DEBATE", "VOTING"].includes(selectedResolution.status)
		) {
			return <ModalDeleteResolution selectedResolution={selectedResolution} />;
		}

		if (isManagement && selectedResolution) {
			return <ModalDeleteResolution selectedResolution={selectedResolution} />;
		}

		return null;
	}

	//send resolution to approval
	if (searchParams["send-resolution-to-approval"]) {
		const selectedResolution = await prisma.resolution.findUnique({
			where: { id: searchParams["send-resolution-to-approval"], status: "SENT_TO_CHAIRS" },
		});

		if (!selectedResolution) return null;
		const isAllowedToSendResolutionToApproval = isChair || isManagement;

		if (isAllowedToSendResolutionToApproval) return <ModalSendToApprovalPanel selectedResolution={selectedResolution} />;
	}

	return null;
}
