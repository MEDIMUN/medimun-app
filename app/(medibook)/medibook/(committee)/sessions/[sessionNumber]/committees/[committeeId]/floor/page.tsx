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
			status: "IN_DEBATE",
			committee: {
				OR: [{ id: params.committeeId }, { slug: params.committeeId }],
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
				<TopBar hideSearchBar title="Floor" />
				<MainWrapper>
					<p>There are no resolutions in debate in this committee.</p>
				</MainWrapper>
			</>
		);
	}

	return <ResolutionPageGA resoId={selectedResolution?.id} {...props} />;
}
