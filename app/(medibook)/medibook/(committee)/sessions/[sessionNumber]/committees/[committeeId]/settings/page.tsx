import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { Badge } from "@/components/badge";
import prisma from "@/prisma/client";
import { CommitteeSettingsForm } from "./client-components";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { notFound } from "next/navigation";
import { MainWrapper } from "@/components/main-wrapper";

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const authSession = await auth();

	if (!authorize(authSession, [s.management])) notFound();

	const selectedCommittee = await prisma.committee
		.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.committeeId, session: { number: params.sessionNumber } },
					{ slug: params.committeeId, session: { number: params.sessionNumber } },
				],
			},
			include: { session: true, chair: { select: { user: true } }, ExtraCountry: true },
		})
		.catch(notFound);

	return (
		<>
			<TopBar
				title={
					<>
						Committee Settings
						<Badge color="red" className="ml-2 -translate-y-[2px]">
							Management Only
						</Badge>
					</>
				}
				buttonText={selectedCommittee.name}
				buttonHref={`/medibook/sessions/${selectedCommittee.session.number}/committees/${selectedCommittee.slug || selectedCommittee.id}`}
				hideSearchBar
			/>
			<MainWrapper>
				<CommitteeSettingsForm selectedCommittee={selectedCommittee} />
			</MainWrapper>
		</>
	);
}
