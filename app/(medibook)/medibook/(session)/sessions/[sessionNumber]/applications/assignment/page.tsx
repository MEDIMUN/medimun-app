import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import Paginator from "@/components/pagination";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { FinalAssignDelegates } from "./client-components";
import { romanize } from "@/lib/romanize";
import { MainWrapper } from "@/components/main-wrapper";

export function sortProposal(proposal, committees) {
	return proposal
		.sort((a: { committeeId: string }, b: { committeeId: string }) => {
			const selectedCommitteeA = committees.find((c) => c.id === a.committeeId);
			const selectedCommitteeB = committees.find((c) => c.id === b.committeeId);
			if (!selectedCommitteeA || !selectedCommitteeB) return 0;
			if (selectedCommitteeA.name < selectedCommitteeB.name) return -1;
			if (selectedCommitteeA.name > selectedCommitteeB.name) return 1;
			return 0;
		})
		.sort((a: { countryCode: number }, b: { countryCode: number }) => {
			if (a.countryCode < b.countryCode) return -1;
			if (a.countryCode > b.countryCode) return 1;
		});
}

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const authSession = await auth();
	const isAuthorized = authorize(authSession, [s.management]);
	const query = searchParams.search || "";
	const currentPage = searchParams.page || 1;
	if (!authSession || !isAuthorized) notFound();

	const selectedSession = await prisma.session.findFirst({
		where: { number: params.sessionNumber },
		include: { committee: true },
	});

	if (!selectedSession) notFound();

	const whereObject = {
		sessionId: selectedSession.id,
		OR: [{ school: { name: { contains: query, mode: "insensitive" } } }, { id: { contains: query, mode: "insensitive" } }],
	};

	const delegateProposals = await prisma.schoolDelegationProposal.findMany({
		where: whereObject as any,
		take: 10,
		skip: currentPage * 10 - 10,
		include: {
			school: {
				include: {
					director: { where: { sessionId: selectedSession.id }, select: { user: true } },
					ApplicationGrantedDelegationCountries: { where: { sessionId: selectedSession.id } },
					finalDelegation: { where: { sessionId: selectedSession.id } },
				},
			},
		},
	});

	const totalItems = await prisma.schoolDelegationProposal.count({ where: whereObject as any });

	const parsedDelegateProposals = delegateProposals.map((proposal) => {
		const { assignment, changes, ...others } = proposal;
		return {
			assignment: JSON.parse(assignment),
			changes: changes ? JSON.parse(changes) : [],
			...others,
		};
	});

	const userIds = parsedDelegateProposals.reduce((acc, proposal) => {
		const studentIds2 = proposal.changes.map((a) => a.studentId);
		const studentIds = proposal.assignment.map((a) => a.studentId).concat(studentIds2);
		return acc.concat(studentIds);
	}, []);

	const allUsers = await prisma.user.findMany({ where: { id: { in: userIds } } });

	return (
		<>
			<TopBar
				title="Delegate Assignment"
				buttonText={`Session ${romanize(selectedSession.numberInteger)} Applications`}
				buttonHref={`/medibook/sessions/${selectedSession.number}/applications`}>
				<SearchParamsButton searchParams={{ "add-delegation-proposal": true }}>Add Proposal</SearchParamsButton>
			</TopBar>
			<MainWrapper>
				{!!delegateProposals.length && (
					<FinalAssignDelegates selectedSession={selectedSession} users={allUsers} delegateProposalsInitial={parsedDelegateProposals} />
				)}
				<Paginator totalItems={totalItems} itemsPerPage={10} itemsOnPage={delegateProposals.length} />
			</MainWrapper>
		</>
	);
}
