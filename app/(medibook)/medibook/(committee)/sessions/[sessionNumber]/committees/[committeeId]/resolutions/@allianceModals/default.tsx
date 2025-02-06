import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { ModalCreateAlliance, ModalDeleteAlliance, ModalInviteAllianceMember, ModalLeaveAlliance, ModalTransferAllianceOwner } from "./modals";

export default async function Modals(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;
	const authSession = await auth();
	if (!authSession) return null;

	if (searchParams["create-alliance"]) {
		const selectedCommittee = await prisma.committee.findUnique({
			where: {
				id: searchParams["create-alliance"],
				session: { number: params.sessionNumber },
				OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
			},
			include: { Topic: true },
		});

		if (!selectedCommittee) return null;

		return <ModalCreateAlliance selectedCommittee={selectedCommittee} />;
	}

	//transfer-alliance-owner AND delegate-id
	if (searchParams["transfer-alliance-owner"] && searchParams["delegate-id"]) {
		const selectedAlliance = await prisma.alliance.findUnique({
			where: {
				id: searchParams["transfer-alliance-owner"],
				committee: {
					session: { number: params.sessionNumber },
					OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
				},
			},
		});

		if (!selectedAlliance) return null;

		const selectedDelegate = await prisma.delegate.findUnique({
			where: {
				id: searchParams["delegate-id"],
				committee: {
					session: { number: params.sessionNumber },
					OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
				},
			},
		});

		if (!selectedDelegate) return null;

		return <ModalTransferAllianceOwner selectedAlliance={selectedAlliance} />;
	}

	//invite-alliance-member
	if (searchParams["invite-alliance-member"]) {
		const selectedAlliance = await prisma.alliance.findUnique({
			where: {
				id: searchParams["invite-alliance-member"],
				committee: {
					session: { number: params.sessionNumber },
					OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
				},
			},
			include: {
				committee: {
					select: {
						delegate: {
							orderBy: { country: "asc" },
							where: {
								AllianceMemberInvitation: {
									none: {
										allianceId: searchParams["invite-alliance-member"],
									},
								},
								AllianceMember: {
									none: {
										allianceId: searchParams["invite-alliance-member"],
									},
								},
							},
							include: { user: true },
						},
						ExtraCountry: true,
					},
				},
			},
		});

		if (!selectedAlliance) return null;

		return <ModalInviteAllianceMember applicableDelegates={selectedAlliance.committee.delegate} selectedAlliance={selectedAlliance} />;
	}

	//leave-alliance
	if (searchParams["leave-alliance"]) {
		const selectedAlliance = await prisma.alliance.findUnique({
			where: {
				id: searchParams["leave-alliance"],
				AllianceMember: { some: { delegate: { userId: authSession.user.id } } },
			},
			include: {
				topic: true,
				committee: { include: { Topic: true } },
			},
		});

		if (!selectedAlliance) return null;

		return <ModalLeaveAlliance selectedAlliance={selectedAlliance} />;
	}

	//delete-alliance
	if (searchParams["delete-alliance"]) {
		const selectedAlliance = await prisma.alliance.findUnique({
			where: {
				id: searchParams["delete-alliance"],
				committee: {
					session: { number: params.sessionNumber },
					OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
				},
			},
		});

		if (!selectedAlliance) return null;

		return <ModalDeleteAlliance selectedAlliance={selectedAlliance} />;
	}

	return null;
}
