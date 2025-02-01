import { TopBar } from "@/components/top-bar";
import { ActionList } from "@/app/components/actions-list";
import { auth } from "@/auth";
import { MainWrapper } from "@/components/main-wrapper";
import { authorize, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

export default function Page(props) {
	return (
		<Suspense fallback={<TopBar title="Print Centre" buttonText={`Sessions`} buttonHref={`/medibook/sessions/`}></TopBar>}>
			<PrintCentre {...props} />
		</Suspense>
	);
}

export async function PrintCentre(props) {
	await connection();
	const params = await props.params;

	const authSession = await auth();
	if (!authSession) return notFound();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return notFound();

	const selectedSession = await prisma.session.findFirstOrThrow({ where: { number: params.sessionNumber } }).catch(notFound);
	const actions = [
		{
			title: "Print Nametags",
			description: "Print nametags for the session",
			href: `/medibook/sessions/${selectedSession.number}/print/nametags`,
		},
		{
			title: "Print Certificates",
			description: "Print certificates for the session",
			href: `/medibook/sessions/${selectedSession.number}/print/certificates`,
		},
	];

	return (
		<>
			<TopBar
				buttonText={`Session ${romanize(selectedSession.numberInteger)}`}
				buttonHref={`/medibook/sessions/${selectedSession.number}`}
				hideSearchBar
				title="Print Centre"
			/>
			<MainWrapper>
				<ActionList actions={actions} />
			</MainWrapper>
		</>
	);
}
