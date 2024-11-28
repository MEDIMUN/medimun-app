import { SearchParamsButton, TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { InteractiveMap } from "@/app/(medibook)/medibook/interactive-map";
import { ActionList } from "@/app/components/actions-list";
import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { Divider } from "@/components/divider";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "@/lib/authorize";
import { cn } from "@/lib/cn";
import { romanize } from "@/lib/romanize";
import { displayNumberInSentenceAsText } from "@/lib/text";
import prisma from "@/prisma/client";
import { Avatar } from "@nextui-org/avatar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	const selectedCommittee = await prisma.committee
		.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.committeeId, session: { number: params.sessionNumber } },
					{ slug: { equals: params.committeeId, mode: "insensitive" }, session: { number: params.sessionNumber } },
				],
			},
			include: { session: true, chair: { select: { user: true } }, delegate: { select: { country: true } } },
		})
		.catch(notFound);

	const isChair = authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isDelegate = authorizeDelegateCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isChairOrDelegate = isChair || isDelegate;
	const isManagementOrChair = isManagement || isChair;
	const isManagementChairOrDelegate = isManagement || isChairOrDelegate;

	const basePath = `/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}`;

	const actions = [
		{
			title: "Committee Announcements",
			description: "Announcements for the committee.",
			href: `${basePath}/announcements`,
			isVisible: isManagementChairOrDelegate,
		},
		{
			title: "Meet the Chairs",
			description: "Meet the chairs of the committee.",
			href: `${basePath}/chairs`,
			isVisible: true,
		},
		{
			title: "Committee Resources",
			description: "Applications for the position of Manager",
			href: `${basePath}/resources`,
			isVisible: isManagementChairOrDelegate,
		},
		{
			title: "Topics",
			description: "Topics for the committee.",
			href: `${basePath}/topics`,
			isVisible: true,
		},
		{
			title: "Resolutions",
			description: "Resolutions for the committee.",
			href: `${basePath}/resolutions`,
			isVisible: isManagementChairOrDelegate,
		},
		{
			title: "Chat",
			description: "Chat with other committee delegates.",
			href: `${basePath}/chat`,
			isVisible: isManagementChairOrDelegate,
		},
		{
			title: "Position Papers",
			description: "Position papers uploads and feedback.",
			href: `${basePath}/position-papers`,
			isVisible: isManagementChairOrDelegate,
		},
		{
			title: "Participants",
			description: "Participants in the committee.",
			href: `${basePath}/delegates`,
			isVisible: isManagementChairOrDelegate,
		},
		{
			title: "Roll Calls",
			description: "Roll calls for the committee.",
			href: `${basePath}/roll-calls`,
			isVisible: isManagementChairOrDelegate,
		},
		{
			title: "Settings",
			description: "Settings for the committee.",
			href: `${basePath}/settings`,
			isVisible: isManagement,
		},
	].filter((x) => x.isVisible);

	return (
		<>
			<TopBar
				hideBackdrop
				title={selectedCommittee.name}
				subheading={
					!!selectedCommittee.chair.length && (
						<div className="text-zinc-700 gap-1 flex md:text-sm">
							<span>Chaired by </span>
							{selectedCommittee.chair.map((chair: any, index: number) => {
								const user = chair?.user;
								const displayNameShortened =
									user?.displayName?.split(" ").length === 1
										? user?.displayName
										: user?.displayName?.split(" ")[0] + " " + user?.displayName?.split(" ")[1][0] + ".";
								const fullName = user?.displayName ? displayNameShortened : user?.officialName.split(" ")[0] + " " + user?.officialSurname[0] + ".";

								return (
									<UserTooltip userId={user.id} key={Math.random()}>
										{`${fullName} ${index < selectedCommittee.chair.length - 2 ? ", " : index === selectedCommittee.chair.length - 2 ? " & " : ""}`}
									</UserTooltip>
								);
							})}
						</div>
					)
				}
				buttonText={`Session ${romanize(selectedCommittee.session.numberInteger)} Committees`}
				buttonHref={`/medibook/sessions/${selectedCommittee.session.number}/committees`}
				hideSearchBar>
				{isManagement && <SearchParamsButton searchParams={{ "edit-committee": selectedCommittee.id }}>Edit Committee</SearchParamsButton>}
			</TopBar>
			<div className="flex h-[200px] w-full overflow-hidden rounded-xl bg-[url(/assets/medibook-session-welcome.webp)] bg-cover bg-right ring-1 ring-gray-200 md:h-[328px]">
				<div className="mt-auto p-5">
					<p className="font-[canela] text-2xl text-primary md:text-4xl">{displayNumberInSentenceAsText(selectedCommittee.name)}</p>
					{selectedCommittee.description && <p className="font-[canela] text-medium text-zinc-700 md:text-2xl">{selectedCommittee.description}</p>}
				</div>
			</div>
			<ActionList actions={actions} />
		</>
	);
}
