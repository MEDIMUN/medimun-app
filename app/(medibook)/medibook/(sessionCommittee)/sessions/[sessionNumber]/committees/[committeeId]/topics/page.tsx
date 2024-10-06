import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import Icon from "@/components/icon";
import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Text } from "@/components/text";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";
import { processMarkdownPreview } from "@/lib/text";
import Paginator from "@/components/pagination";

export default async function Page({ params }) {
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
			include: { Topic: true },
		})
		.catch(notFound);
	const isChairOfCommittee = false || authorizeChairCommittee(authSession?.currentRoles, selectedCommittee.id);
	const topics = selectedCommittee?.Topic;

	return (
		<>
			<TopBar
				hideSearchBar
				title="Topics"
				buttonText={selectedCommittee.name}
				buttonHref={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}`}>
				{isManagement && <SearchParamsButton searchParams={{ "create-topic": selectedCommittee.id }}>Create Topic</SearchParamsButton>}
			</TopBar>
			{!!topics.length && (
				<Table>
					<TableHead>
						<TableRow>
							<TableHeader>
								<span className="sr-only">Actions</span>
							</TableHeader>
							<TableHeader>Topic</TableHeader>
							<TableHeader>Description</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{topics.map((topic) => (
							<TableRow key={topic.id}>
								<TableCell>
									{isChairOfCommittee || isManagement ? (
										<Dropdown>
											<DropdownButton plain aria-label="More options">
												<EllipsisVerticalIcon />
											</DropdownButton>
											<DropdownMenu anchor="bottom end">
												{topic.description && (
													<DropdownItem
														href={`/medibook/sessions/${params.sessionNumber}/committees/${selectedCommittee.slug || selectedCommittee.id}/topics/${
															topic.id
														}`}>
														View
													</DropdownItem>
												)}
												<SearchParamsDropDropdownItem searchParams={{ "edit-topic": topic.id }}>Edit Topic</SearchParamsDropDropdownItem>
												{isManagement && (
													<SearchParamsDropDropdownItem searchParams={{ "delete-topic": topic.id }}>Delete Topic</SearchParamsDropDropdownItem>
												)}
											</DropdownMenu>
										</Dropdown>
									) : (
										topic.description && (
											<Button
												href={`/medibook/sessions/${params.sessionNumber}/committees/${selectedCommittee.slug || selectedCommittee.id}/topics/${
													topic.id
												}`}
												plain>
												View Details
											</Button>
										)
									)}
								</TableCell>
								<TableCell>{topic.title}</TableCell>
								<TableCell>{topic.description ? processMarkdownPreview(topic.description) : "-"}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
			<Paginator totalItems={topics.length} itemsPerPage={10} itemsOnPage={topics.length} />
		</>
	);
}
