import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

export default async function Page({ params, searchParams }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	const selectedCommittee = await prisma.committee
		.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.committeeId, session: { number: params.sessionNumber } },
					{ slug: { equals: params.committeeId, mode: "insensitive" }, session: { number: params.sessionNumber } },
				],
			},
			include: { session: true, chair: { select: { user: true } } },
		})
		.catch(notFound);

	return (
		<>
			<TopBar
				title={selectedCommittee.name}
				buttonText={`Session ${romanize(selectedCommittee.session.numberInteger)} Committees`}
				buttonHref={`/medibook/sessions/${selectedCommittee.session.number}/committees`}
				hideSearchBar
				subheading={selectedCommittee.description}>
				{isManagement && <SearchParamsButton searchParams={{ "edit-committee": selectedCommittee.id }}>Edit Committee</SearchParamsButton>}
			</TopBar>
			<div className="mx-auto grid w-full max-w-[1200px] gap-2 p-4 md:flex-row">
				<p>Comt</p>
			</div>
		</>
	);
}
