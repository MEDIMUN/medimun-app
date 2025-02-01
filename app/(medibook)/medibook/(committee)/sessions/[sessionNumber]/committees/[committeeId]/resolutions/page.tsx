import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { connection } from "next/server";

export default async function Page(props) {
	await connection();
	const params = await props.params;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	const selectedSession = await prisma.session
		.findFirstOrThrow({
			where: {
				number: params.sessionNumber,
				...(isManagement ? {} : { isPartlyVisible: true }),
			},
			include: {
				committee: {
					where: { OR: [{ id: params.committeeId }, { slug: params.committeeId }] },
					take: 1,
				},
			},
		})
		.catch(notFound);

	const isChairOfCommittee = authorizeChairCommittee(
		[...(authSession?.user?.currentRoles || []), ...(authSession?.user?.pastRoles || [])],
		selectedSession.committee[0].id
	);

	const isDelegateOfCommittee = authorizeDelegateCommittee(
		[...(authSession?.user?.currentRoles || []), ...(authSession?.user?.pastRoles || [])],
		selectedSession.committee[0].id
	);

	const isPartOfCommittee = isChairOfCommittee || isDelegateOfCommittee || authorize(authSession, [s.manager, s.member]) || isManagement;

	if (!isPartOfCommittee) notFound();

	return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}`}
				buttonText={selectedSession.committee[0].name}
				title="Committee Resolutions">
				<SearchParamsButton disabled searchParams={{ "add-committee-resolution": true }}>
					Add Resolution
				</SearchParamsButton>
			</TopBar>
		</>
	);
}
