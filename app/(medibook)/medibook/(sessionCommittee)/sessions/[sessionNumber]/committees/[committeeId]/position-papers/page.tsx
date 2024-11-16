import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Button } from "@/components/button";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

export default async function Page(props) {
	const params = await props.params;
	const authSession = await auth();
	if (!authSession) notFound();

	const isManagement = authorize(authSession, [s.management]);

	const selectedCommittee = await prisma.committee
		.findFirstOrThrow({
			where: {
				OR: [{ slug: params.committeeId }, { id: params.committeeId }],
				session: { number: params.sessionNumber, ...(!isManagement ? { isPartlyVisible: true } : {}) },
				...(isManagement ? {} : { isVisible: true }),
			},
		})
		.catch(notFound);

	return (
		<>
			<TopBar
				hideBackdrop
				hideSearchBar
				buttonHref={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}`}
				buttonText={selectedCommittee.name}
				title="Position Papers">
				<Button disabled>Upload</Button>
			</TopBar>
		</>
	);
}
