import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import Paginator from "@/components/pagination";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { FinalAssignDelegates } from "./client-components";
import { romanize } from "@/lib/romanize";

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

    const whereObject = {
		sessionId: selectedSession.id,
		OR: [{ school: { name: { contains: query, mode: "insensitive" } } }, { id: { contains: query, mode: "insensitive" } }],
	};

    const delegateProposals = await prisma.schoolDelegationProposal.findMany({
		where: whereObject,
		take: 10,
		skip: currentPage * 10 - 10,
		include: {
			school: {
				include: {
					finalDelegation: {
						where: {
							sessionId: selectedSession.id,
						},
					},
				},
			},
		},
	});

    const totalItems = await prisma.schoolDelegationProposal.count({ where: whereObject });

    const parsedDelegateProposals = delegateProposals.map((proposal) => {
		const { assignment, ...others } = proposal;
		return {
			assignment: JSON.parse(assignment),
			...others,
		};
	});

    const userIds = parsedDelegateProposals.reduce((acc, proposal) => {
		const studentIds = proposal.assignment.map((a) => a.studentId);
		return acc.concat(studentIds);
	}, []);

    const allUsers = await prisma.user.findMany({ where: { id: { in: userIds } } });

    return (
		<>
			<TopBar
				title="Delegate Assignments"
				buttonText={`Session ${romanize(selectedSession.numberInteger)} Applications`}
				buttonHref={`/medibook/sessions/${selectedSession.number}/applications`}
				hideSearchBar
			/>
			<FinalAssignDelegates selectedSession={selectedSession} users={allUsers} delegateProposals={parsedDelegateProposals} />
			<Paginator totalItems={totalItems} itemsPerPage={10} itemsOnPage={delegateProposals.length} />
		</>
	);
}
