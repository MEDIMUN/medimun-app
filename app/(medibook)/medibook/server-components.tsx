import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { SearchParamsButton, SearchParamsDropDropdownItem, SessionResourceDropdown, TopBar } from "./client-components";
import { Link } from "@/components/link";
import { Badge } from "@/components/badge";
import { romanize } from "@/lib/romanize";
import { capitaliseEachWord, processMarkdownPreview } from "@/lib/text";
import { authorizedToEditResource } from "./@resourceModals/default";
import { auth } from "@/auth";
import { Divider } from "@/components/divider";
import { Text } from "@/components/text";
import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { announcementWebsitecomponents, authorizedToEditAnnouncement } from "./@announcement/default";
import Paginator from "@/components/pagination";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound, redirect } from "next/navigation";
import { Fragment, Suspense } from "react";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { Subheading } from "@/components/heading";
import { PageCreateAnnouncement } from "./@announcement/pageCreateAnnouncement";
import { cn } from "@/lib/cn";

const columns = ["Name", "Uploader", "Date Uploaded", "Tags"];

export async function ResourcesTable({ resources, isManagement, tableColumns = columns }) {
	function replaceMergedWords(string) {
		string = string.replace("Seniordirectors", "Senior Directors");
		string = string.replace("Schooldirectors", "School Directors");
		return string;
	}

	if (!!resources.length)
		return (
			<Table className="showscrollbar">
				<TableHead>
					<TableRow>
						{[
							<span key="actions" className="sr-only">
								Actions
							</span>,
							...tableColumns,
						].map((row, i) => (
							<TableHeader key={i}>{row}</TableHeader>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{resources.map((resource) => {
						const fullName = resource.user.displayName || `${resource.user.officialName} ${resource.user.officialSurname}`;
						return (
							<TableRow key={resource.id}>
								<TableCell>
									<SessionResourceDropdown selectedResource={resource} />
								</TableCell>
								{tableColumns.includes("Name") && (
									<TableCell>
										<Link
											target="_blank"
											className="hover:underline"
											href={resource.driveUrl ? `https://${resource.driveUrl}` : `/medibook/resources/${resource.id}`}>
											{resource.isPinned && "📌 "}
											{resource.name}
										</Link>
									</TableCell>
								)}
								{tableColumns.includes("Scope") && (
									<TableCell>
										<div className="mr-auto flex flex-wrap gap-1">
											{resource.scope.map((scope, index) => {
												if (scope.includes("SESSION")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{replaceMergedWords(capitaliseEachWord(scope.replace("SESSION", "")))} (Session {romanize(resource?.session?.number)})
														</Badge>
													);
												}
												if (scope.includes("COMMITTEE")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{replaceMergedWords(capitaliseEachWord(scope.replace("COMMITTEE", "")))} viewing{" "}
															{resource?.committee?.shortName || resource?.committee?.name} in Session {romanize(resource?.committee?.session.number)}
														</Badge>
													);
												}
												if (scope.includes("DEPARTMENT")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{replaceMergedWords(capitaliseEachWord(scope.replace("DEPARTMENT", "")))} viewing{" "}
															{resource?.department?.shortName || resource?.department?.name} in Session{" "}
															{romanize(resource?.department?.session.number)}
														</Badge>
													);
												}
												if (scope.includes("PERSONAL")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{replaceMergedWords(capitaliseEachWord(scope))}
														</Badge>
													);
												}
												return (
													<Badge key={index} color="purple" className="max-w-min">
														{replaceMergedWords(capitaliseEachWord(scope))}
													</Badge>
												);
											})}
										</div>
									</TableCell>
								)}
								{tableColumns.includes("Uploader") && (
									<TableCell>{resource.isAnonymous ? (isManagement ? `${fullName} (Anonymous)` : "-") : fullName}</TableCell>
								)}
								{tableColumns.includes("Date Uploaded") && <TableCell>{resource.time.toLocaleString("uk-en").replace(",", " at")}</TableCell>}
								{tableColumns.includes("Tags") && (
									<TableCell>
										{resource.driveUrl ? (
											<Badge color="yellow" className="mr-2">
												External File
											</Badge>
										) : resource.fileId ? (
											<Badge color="green" className="mr-2">
												Local File
											</Badge>
										) : (
											<Badge className="mr-2">Unknown</Badge>
										)}
										{resource.isPrivate && (
											<Badge className="mr-2" color="red">
												Private
											</Badge>
										)}
										{resource.scope?.includes("SESSIONPROSPECTUS") && <Badge color="blue">Session Prospectus</Badge>}
									</TableCell>
								)}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		);
}

const itemsPerPage = 10;

export async function AnnouncementsTable({ title, announcements, baseUrl, totalItems, buttonHref, buttonText, showPublishButton }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	return (
		<>
			<TopBar buttonHref={buttonHref} buttonText={buttonText} title={title || "Announcements"}>
				{showPublishButton && <Button href={baseUrl + "/publish"}>Publish</Button>}
			</TopBar>
			{!!announcements.length && (
				<ul className="grid grid-flow-row">
					{announcements.map((announcement, index) => {
						const fullName = announcement.user.displayName || `${announcement.user.officialName} ${announcement.user.officialSurname}`;
						const url = `${baseUrl}/${announcement.id}${announcement.slug ? "/" : ""}${announcement.slug ? announcement.slug : ""}`;
						const isTimeSame = announcement.time.toLocaleTimeString() == announcement.editTime.toLocaleTimeString();
						return (
							<Fragment key={announcement.id}>
								<li className="my-6 min-h-24">
									<div className="flex gap-2">
										<div className="max-w-auto w-full">
											<Link href={url} className="!cursor-pointer hover:underline">
												<h3 className="text-base/6 font-semibold">{announcement.title}</h3>
											</Link>
											<Text className="line-clamp-2">{processMarkdownPreview(announcement.markdown)}</Text>
											<div className="mt-2 flex flex-wrap gap-2 md:flex-row">
												<Badge className="max-w-max px-2 !rounded-full">
													{announcement?.privacy === "ANONYMOUS" && (isManagement ? `${fullName} (Anonymous)` : "Anonymous")}
													{announcement?.privacy === "BOARD" &&
														(isManagement ? `${fullName} (Anonymous - Board of Directors)` : "Board of Directors")}
													{announcement?.privacy === "NORMAL" && fullName}
													{announcement?.privacy === "SECRETARIAT" && (isManagement ? `${fullName} (Secretariat)` : "Secretariat")}
												</Badge>
												{isTimeSame ? (
													<Badge className="max-w-max px-2 !rounded-full">{announcement.time.toLocaleString("uk").replace(",", " -")}</Badge>
												) : (
													<Badge className="max-w-max px-2 !rounded-full">
														Edited {announcement.editTime.toLocaleString("uk").replace(",", " -")}
													</Badge>
												)}
											</div>
										</div>
										<div className="ml-2 flex">
											<Dropdown>
												<DropdownButton className="my-auto max-h-max" plain aria-label="More options">
													<EllipsisVerticalIcon />
												</DropdownButton>
												<DropdownMenu anchor="bottom end">
													<DropdownItem href={url}>View</DropdownItem>
													{authorizedToEditAnnouncement(authSession, announcement) && (
														<>
															<SearchParamsDropDropdownItem url={url} searchParams={{ "edit-announcement": announcement.id }}>
																Edit
															</SearchParamsDropDropdownItem>
															<SearchParamsDropDropdownItem searchParams={{ "delete-announcement": announcement.id }}>
																Delete
															</SearchParamsDropDropdownItem>
														</>
													)}
												</DropdownMenu>
											</Dropdown>
										</div>
									</div>
								</li>
								{index < announcements.length - 1 && <Divider />}
							</Fragment>
						);
					})}
				</ul>
			)}
			<Paginator itemsOnPage={announcements.length} totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}

export async function AnnouncementViewPage({ params, searchParams }) {
	const authSession = await auth();
	let selectedAnnouncement, selectedCommittee, selectedDepartment, selectedSession;
	try {
		selectedAnnouncement = await prisma.announcement.update({
			where: { id: params.announcementId[0] },
			data: { views: { increment: 1 } },
			include: {
				session: true,
				committee: { include: { session: true } },
				department: { include: { session: true } },
				user: true,
			},
		});
	} catch (e) {
		if (!(params.announcementId[0] === "publish")) notFound();
	}

	let baseUrl = "/medibook/announcements";
	let buttonText = "Global Announcements";
	let buttonHref = "/medibook/announcements";
	let createType: "globalAnnouncement" | "sessionAnnouncement" | "committeeAnnouncement" | "departmentAnnouncement" = "globalAnnouncement";

	if (params.sessionNumber && !params.committeeId && !params.departmentId) {
		const selectedSession = await prisma.session.findUnique({
			where: {
				number: params.sessionNumber,
			},
		});
		baseUrl = `/medibook/sessions/${selectedSession.number}/announcements`;
		buttonText = `Session ${romanize(selectedSession.numberInteger)} Announcements`;
		buttonHref = `/medibook/sessions/${selectedSession.number}/announcements`;
		createType = "sessionAnnouncement";
	}

	if (params.committeeId && !params.departmentId && params.sessionNumber) {
		selectedCommittee = await prisma.committee.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.committeeId, session: { number: params.sessionNumber } },
					{ slug: params.committeeId, session: { number: params.sessionNumber } },
				],
			},
			include: { session: true },
		});
		baseUrl = `/medibook/sessions/${selectedCommittee.session.number}/committees/${selectedCommittee.slug || selectedCommittee.id}/announcements`;
		buttonText = `${selectedCommittee.name} Announcements`;
		buttonHref = `/medibook/sessions/${selectedCommittee.session.number}/committees/${selectedCommittee.slug || selectedCommittee.id}/announcements`;
		createType = "committeeAnnouncement";
	}

	if (params.departmentId && !params.committeeId && params.sessionNumber) {
		selectedDepartment = await prisma.department.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.departmentId, session: { number: params.sessionNumber } },
					{ slug: params.departmentId, session: { number: params.sessionNumber } },
				],
			},
			include: { session: true },
		});
		baseUrl = `/medibook/sessions/${selectedDepartment.session.number}/departments/${selectedDepartment.slug || selectedDepartment.id}/announcements`;
		buttonText = `${selectedDepartment.name} Announcements`;
		buttonHref = `/medibook/sessions/${selectedDepartment.session.number}/departments/${selectedDepartment.slug || selectedDepartment.id}`;
		createType = "departmentAnnouncement";
	}

	if (selectedAnnouncement?.slug !== params?.announcementId[1]) {
		if (selectedAnnouncement?.slug) return redirect(`${baseUrl}/${selectedAnnouncement.id}/${selectedAnnouncement.slug}`);
	}

	if (params.announcementId[0] === "publish") {
		return <PageCreateAnnouncement committeeId={selectedCommittee?.id} departmentId={selectedDepartment?.id} returnUrl={baseUrl} type={createType} />;
	}

	if (searchParams["edit-announcement"]) {
		return null;
	}

	if (!selectedAnnouncement) return;

	const authorizedToEdit = authorizedToEditAnnouncement(authSession, selectedAnnouncement);

	return (
		<>
			<TopBar
				hideSearchBar
				buttonHref={buttonHref}
				buttonText={buttonText}
				title={selectedAnnouncement.title}
				subheading={selectedAnnouncement.description}>
				{authorizedToEdit && (
					<SearchParamsButton color="red" searchParams={{ "delete-announcement": selectedAnnouncement.id }}>
						Delete
					</SearchParamsButton>
				)}
				{authorizedToEdit && <SearchParamsButton searchParams={{ "edit-announcement": selectedAnnouncement.id }}>Edit</SearchParamsButton>}
			</TopBar>
			<Suspense fallback={<div>404</div>}>
				{/* @ts-ignore */}
				<MDXRemote components={{ ...announcementWebsitecomponents }} source={selectedAnnouncement.markdown} />
			</Suspense>
		</>
	);
}

export function ActionList({ actions }) {
	return (
		<div className="divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 ring-1 ring-gray-200 dark:bg-ring-gray-800 sm:grid sm:grid-cols-1 sm:gap-px sm:divide-y-0">
			{actions.map((action, actionIdx) => (
				<div
					key={action.title}
					className={cn(
						actionIdx === 0 ? "rounded-tl-xl rounded-tr-xl sm:rounded-tr-none" : "",
						actionIdx === actions.length - 1 ? "rounded-bl-xl rounded-br-xl sm:rounded-bl-none" : "",
						"group relative bg-white dark:bg-black p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
					)}>
					<div>
						<h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
							<Link href={action.href} className="focus:outline-none">
								<span aria-hidden="true" className="absolute inset-0" />
								{action.title}
							</Link>
						</h3>
						<p className="mt-2 text-sm text-gray-500">{action.description}</p>
					</div>
					<span aria-hidden="true" className="pointer-events-none absolute right-6 top-6 text-gray-300 dark:text-gray-700 group-hover:text-gray-400">
						<svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6">
							<path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
						</svg>
					</span>
				</div>
			))}
		</div>
	);
}
