import { auth } from "@/auth";
import { TopBar } from "@/components/top-bar";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function Page(props) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SCAlliancePage {...props} />
		</Suspense>
	);
}

export async function SCAlliancePage(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;
	const authSession = await auth();
	if (!authSession) return notFound();

	const selectedAlliance = await prisma.alliance.findUnique({
		where: {
			id: params.allianceId,
			committee: {
				session: { number: params.sessionNumber },
				OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
			},
		},
		include: {
			topic: true,
			mainSubmitter: { include: { user: true } },
			committee: { include: { Topic: true } },
			AllianceMember: { include: { delegate: { include: { user: true } } } },
			AllianceMemberInvitation: true,
		},
	});

	return (
		<>
			<TopBar
				buttonHref={`/medibook/committees/${selectedAlliance?.committee.id}/resolutions`}
				buttonText={"Back to Resolutions"}
				hideSearchBar
				title={`Alliance A${selectedAlliance?.number.toString().padStart(5, "0")}`}
				subheading={selectedAlliance?.topic.title}
			/>
		</>
	);
}
