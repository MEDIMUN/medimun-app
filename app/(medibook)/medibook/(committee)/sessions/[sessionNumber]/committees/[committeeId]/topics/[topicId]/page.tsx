import { announcementWebsitecomponents } from "@/app/(medibook)/medibook/@announcement/default";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Divider } from "@/components/divider";
import { Subheading } from "@/components/heading";
import { Link } from "@/components/link";
import { MainWrapper } from "@/components/main-wrapper";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Page(props) {
	const params = await props.params;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	const selectedTopic = await prisma.topic
		.findUniqueOrThrow({
			where: {
				id: params.topicId,
				description: { not: null },
				...(!isManagement ? {} : { committee: { isVisible: true } }),
				...(!isManagement ? {} : { committee: { session: { isPartlyVisible: true } } }),
			},
			include: { committee: { include: { session: true } } },
		})
		.catch(() => redirect(`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/topics`));

	const isChairOfCommittee = authorizeChairCommittee(authSession.currentRoles, selectedTopic.committee.id);

	return (
		<>
			<TopBar
				hideBackdrop
				buttonText={`${selectedTopic.committee.name} Topics`}
				buttonHref={`/medibook/sessions/${selectedTopic.committee.session.number}/committees/${
					selectedTopic.committee.slug || selectedTopic.committee.id
				}/topics`}
				hideSearchBar
				title={selectedTopic.title}>
				{isManagement && <SearchParamsButton searchParams={{ "delete-topic": selectedTopic.id }}>Delete</SearchParamsButton>}
				{(isManagement || isChairOfCommittee) && <SearchParamsButton searchParams={{ "edit-topic": selectedTopic.id }}>Edit</SearchParamsButton>}
			</TopBar>
			<MainWrapper>
				<Suspense fallback={<div>404</div>}>
					<MDXRemote components={{ ...announcementWebsitecomponents }} source={selectedTopic.description} />
				</Suspense>
				<Divider className="mt-[750px]" />
				<Subheading className="!font-extralight">
					{"We are not responsible for the contents of topic descriptions. Please refer to our "}
					<Link className="underline hover:text-primary" href="/conduct#announcements" target="_blank">
						code of conduct
					</Link>
					{" and "}
					<Link className="underline hover:text-primary" href="/conduct#announcements" target="_blank">
						terms of service
					</Link>
					{" for more information."}
				</Subheading>
			</MainWrapper>
		</>
	);
}
