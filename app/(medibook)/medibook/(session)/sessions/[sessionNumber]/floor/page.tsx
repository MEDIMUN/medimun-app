import { AutoRefresh } from "@/components/auto-refresh";
import { MainWrapper } from "@/components/main-wrapper";
import { TopBar } from "@/components/top-bar";
import ResolutionPageGA from "@/global-pages/resolutionViewer/page";
import prisma from "@/prisma/client";
import { Suspense } from "react";

export default function Page(props) {
	return (
		<Suspense fallback={<TopBar hideSearchBar title="Committee" />}>
			<CommitteePage {...props} />
		</Suspense>
	);
}

export async function CommitteePage(props) {
	const params = await props.params;
	const selectedResolution = await prisma.resolution.findFirst({
		where: {
			plenaryStatus: "IN_DEBATE",
			committee: {
				session: {
					number: params.sessionNumber,
				},
			},
		},
		include: { committee: true },
	});

	if (!selectedResolution) {
		return (
			<>
				<TopBar hideSearchBar title="Plenary Floor" />
				<MainWrapper>
					<p>There are no resolutions put under debate for the plenary.</p>
				</MainWrapper>
			</>
		);
	}

	return (
		<>
			<AutoRefresh /> <ResolutionPageGA resoId={selectedResolution?.id} {...props} />
		</>
	);
}
