import { notFound } from "next/navigation";
import prisma from "@/prisma/client";
import { SettingsForm } from "./client-components";
import { TopBar } from "@/components/top-bar";
import { romanize } from "@/lib/romanize";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { Badge } from "@/components/badge";
import { MainWrapper } from "@/components/main-wrapper";
import { Suspense } from "react";
import { connection } from "next/server";

export default function Page(props) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Settings {...props} />
		</Suspense>
	);
}

export async function Settings(props) {
	await connection();
	const params = await props.params;
	const authSession = await auth();

	const selectedSession = await prisma.session
		.findUniqueOrThrow({
			where: {
				number: params.sessionNumber,
			},
		})
		.catch(notFound);

	const isManagement = authorize(authSession, [s.management]);

	if (!authSession || !isManagement) return notFound();

	return (
		<>
			<TopBar
				hideBackdrop
				buttonText={`Session ${romanize(selectedSession.numberInteger)}`}
				buttonHref={`/medibook/sessions/${selectedSession.number}/`}
				hideSearchBar
				title={
					<>
						Session Settings
						<Badge color="red" className="ml-2 -translate-y-[2px]">
							Management Only
						</Badge>
					</>
				}
			/>
			<MainWrapper>
				<SettingsForm selectedSession={selectedSession} />
			</MainWrapper>
		</>
	);
}
