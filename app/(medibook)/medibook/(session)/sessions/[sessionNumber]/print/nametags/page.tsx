import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { MainWrapper } from "@/components/main-wrapper";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { VariantPicker } from "./_components/variant-selector";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { connection } from "next/server";

export default async function PrintCentre(props) {
	await connection();
	const authSession = await auth();
	if (!authSession) return notFound();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return notFound();
	const params = await props.params;

	const selectedSession = await prisma.session.findFirstOrThrow({ where: { number: params.sessionNumber } }).catch(notFound);

	return (
		<>
			<TopBar
				buttonText={`Session ${romanize(selectedSession.numberInteger)} Print Centre`}
				buttonHref={`/medibook/sessions/${selectedSession.number}/print`}
				hideSearchBar
				title="Print Nametags"
			/>
			<VariantPicker />
		</>
	);
}
