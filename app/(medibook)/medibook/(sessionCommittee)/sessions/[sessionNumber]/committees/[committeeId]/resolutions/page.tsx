import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	const selectedSession = await prisma.session
		.findFirstOrThrow({
			where: {
				number: params.sessionNumber,
				...(isManagement ? {} : { isVisible: true }),
			},
			include: {
				committee: {
					where: {
						OR: [{ id: params.committeeId }, { slug: params.committeeId }],
					},
					take: 1,
				},
			},
		})
		.catch(notFound);

	return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}`}
				buttonText={selectedSession.committee[0].name}
				title="Resolutions"
			/>
		</>
	);
}
