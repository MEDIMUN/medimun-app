import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { authorize, authorizeManagerDepartmentType, s } from "@/lib/authorize";
import { ModalAssignToEditor } from "./modalAssignToEditor";
import { ModalRemoveFromEditor } from "./modalRemoveFromEditor";
import { ModalApproveResolution } from "./modalApproveResolution";
import { ModalSendResolutionBackToCommittee } from "./modalSendResolutionBackToCommittee";

export default async function Modals(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;

	const authSession = await auth();
	if (!authSession) return null;

	if (searchParams["assign-to-editor"]) {
		const isManager = authorize(authSession, [s.manager]);
		const ismanagement = authorize(authSession, [s.management]);
		const isMember = authorize(authSession, [s.member]);

		const allowedMemberDepartmentTypes = ["APPROVAL"];

		const isManagerOfAp: boolean =
			isManager && authSession?.user?.currentRoles.filter((role) => role?.roleIdentifier == "manager").filter((role) => role?.departmentTypes?.some((type) => allowedMemberDepartmentTypes?.includes(type))).length > 0;

		if (!isManagerOfAp && !ismanagement) return null;

		const selectedResolution = await prisma.resolution.findUnique({
			where: {
				id: searchParams["assign-to-editor"],
				status: "SENT_TO_APPROVAL_PANEL",
				committee: {
					session: { number: params.sessionNumber },
				},
			},
			include: {
				topic: true,
				mainSubmitter: { include: { user: true } },
				committee: { include: { Topic: true } },
				CoSubmitters: { include: { delegate: { include: { user: true } } } },
				CoSubmitterInvitation: true,
			},
		});

		const membersOfAp = await prisma.member.findMany({
			where: {
				department: {
					type: {
						has: "APPROVAL",
					},
					session: { number: params.sessionNumber },
				},
			},
			include: {
				user: true,
			},
			orderBy: {
				user: {
					officialName: "asc",
				},
			},
		});

		if (!membersOfAp) return null;

		if (!selectedResolution) return null;

		return <ModalAssignToEditor selectedResolution={selectedResolution} membersOfAp={membersOfAp} />;
	}

	//remove-resolution-from-editor

	if (searchParams["remove-from-editor"]) {
		const ismanagement = authorize(authSession, [s.management]);
		const isManagerOfAp = authorizeManagerDepartmentType(authSession.user.currentRoles, ["APPROVAL"]);

		if (!isManagerOfAp && !ismanagement) return null;

		const selectedResolution = await prisma.resolution.findUnique({
			where: {
				id: searchParams["remove-from-editor"],
				status: "ASSIGNED_TO_EDITOR",
				committee: {
					session: { number: params.sessionNumber },
				},
			},
			include: {
				committee: { include: { Topic: true } },
			},
		});

		if (!selectedResolution) return null;

		return <ModalRemoveFromEditor selectedResolution={selectedResolution} />;
	}

	if (searchParams["approve-resolution"]) {
		const ismanagement = authorize(authSession, [s.management]);
		const isManagerOfAp = authorizeManagerDepartmentType(authSession.user.currentRoles, ["APPROVAL"]);

		if (!isManagerOfAp && !ismanagement) return null;

		const selectedResolution = await prisma.resolution.findUnique({
			where: {
				id: searchParams["approve-resolution"],
				status: {
					in: ["ASSIGNED_TO_EDITOR", "SENT_TO_APPROVAL_PANEL"],
				},
				committee: {
					session: { number: params.sessionNumber },
				},
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

		return <ModalApproveResolution selectedResolution={selectedResolution} />;
	}

	if (searchParams["send-resolution-back-to-committee"]) {
		const ismanagement = authorize(authSession, [s.management]);
		const isManagerOfAp = authorizeManagerDepartmentType(authSession.user.currentRoles, ["APPROVAL"]);

		if (!isManagerOfAp && !ismanagement) return null;

		const selectedResolution = await prisma.resolution.findUnique({
			where: {
				id: searchParams["send-resolution-back-to-committee"],
				status: { in: ["ASSIGNED_TO_EDITOR", "SENT_TO_APPROVAL_PANEL", "SENT_BACK_TO_MANAGER"] },
				committee: { session: { number: params.sessionNumber } },
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

		return <ModalSendResolutionBackToCommittee selectedResolution={selectedResolution} />;
	}

	return null;
}
