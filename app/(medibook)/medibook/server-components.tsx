import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { SearchParamsButton, SearchParamsDropDropdownItem, SessionResourceDropdown, TopBar } from "./client-components";
import { FastLink, FastLink as Link } from "@/components/fast-link";
import { Badge } from "@/components/badge";
import { romanize } from "@/lib/romanize";
import { capitaliseEachWord, processMarkdownPreview } from "@/lib/text";
import { authorizedToEditResource } from "./@resourceModals/default";
import { auth } from "@/auth";

import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { announcementWebsitecomponents, authorizedToEditAnnouncement } from "./@announcement/default";
import Paginator from "@/components/pagination";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { PageCreateAnnouncement } from "./@announcement/pageCreateAnnouncement";
/* @ts-ignore */
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MainWrapper } from "@/components/main-wrapper";
import { ResourceViewer } from "@/components/resource-viewer";
import { connection } from "next/server";

const columns = ["Name", "Uploader", "Date Uploaded", "Tags"];

export async function ResourcesTable({ resources, isManagement, tableColumns = columns, baseUrl }) {
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
											className="hover:underline"
											{...(resource.driveUrl ? { target: "_blank" } : {})}
											href={resource.driveUrl ? `https://${resource.driveUrl}` : `${baseUrl}/${resource.id}`}>
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
	await connection();
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	return (
		<>
			<TopBar buttonHref={buttonHref} buttonText={buttonText} title={title || "Announcements"}>
				{showPublishButton && <Button href={baseUrl + "/publish"}>Publish</Button>}
			</TopBar>
			<MainWrapper>
				{!!announcements.length && (
					<ul className="grid 2xl:grid-cols-3 xl:grid-cols-2 lg:grid-cols-1 gap-4 grid-auto-rows-[minmax(300px,_1fr)]">
						{announcements.map((announcement, index) => {
							const fullName = announcement.user.displayName || `${announcement.user.officialName} ${announcement.user.officialSurname}`;
							const url = `${baseUrl}/${announcement.id}${announcement.slug ? "/" : ""}${announcement.slug ? announcement.slug : ""}`;
							const isTimeSame = announcement.time.toLocaleTimeString() == announcement.editTime.toLocaleTimeString();
							return (
								<Card key={index} className="h-full flex min-h-[200px] flex-col">
									<FastLink href={url}>
										<CardHeader>
											<CardTitle>{announcement.title}</CardTitle>
											<CardDescription>
												{isTimeSame ? (
													<span className="">{announcement.time.toLocaleString("uk").replace(",", " -")}</span>
												) : (
													<span className="">Edited {announcement.editTime.toLocaleString("uk").replace(",", " -")}</span>
												)}
												{" • by "}
												<span>
													{announcement?.privacy === "ANONYMOUS" && (isManagement ? `${fullName} (Anonymous)` : "Anonymous")}
													{announcement?.privacy === "BOARD" &&
														(isManagement ? `${fullName} (Anonymous - Board of Directors)` : "Board of Directors")}
													{announcement?.privacy === "NORMAL" && fullName}
													{announcement?.privacy === "SECRETARIAT" && (isManagement ? `${fullName} (Secretariat)` : "Secretariat")}
												</span>
											</CardDescription>
										</CardHeader>
									</FastLink>
									<FastLink href={url}>
										<CardContent className="mt-auto">
											<span className="line-clamp-2">{processMarkdownPreview(announcement.markdown)}</span>
										</CardContent>
									</FastLink>
									<CardFooter className="flex mt-auto flex-1 gap-1">
										{authorizedToEditAnnouncement(authSession, announcement) ? (
											<Dropdown>
												<DropdownButton className="ml-auto mt-auto max-h-max" aria-label="More options">
													Options
												</DropdownButton>
												<DropdownMenu anchor="bottom end">
													<DropdownItem href={url}>View</DropdownItem>
													<SearchParamsDropDropdownItem url={url} searchParams={{ "edit-announcement": announcement.id }}>
														Edit
													</SearchParamsDropDropdownItem>
													<SearchParamsDropDropdownItem searchParams={{ "delete-announcement": announcement.id }}>
														Delete
													</SearchParamsDropDropdownItem>
												</DropdownMenu>
											</Dropdown>
										) : (
											<FastLink className="ml-auto" href={url}>
												<Button className="ml-auto mt-auto">View</Button>
											</FastLink>
										)}
									</CardFooter>
								</Card>
							);
						})}
					</ul>
				)}
				<Paginator itemsOnPage={announcements.length} totalItems={totalItems} itemsPerPage={itemsPerPage} />
			</MainWrapper>
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
				hideBackdrop
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
			<MainWrapper>
				<Suspense fallback={<div>404</div>}>
					{/* @ts-ignore */}
					<MDXRemote components={{ ...announcementWebsitecomponents }} source={selectedAnnouncement.markdown} />
				</Suspense>
			</MainWrapper>
		</>
	);
}

export async function ResourceViewPage(props) {
	const params = await props.params;
	const authSession = await auth();
	if (!authSession) notFound();
	const selectedResource = await prisma.resource.findFirst({ where: { id: params.resourceId } });

	const isDrive = props?.isDrive;

	let buttonText = isDrive ? "Personal Drive" : "Global Resources";
	let buttonHref = isDrive ? "/medibook/drive" : "/medibook/resources";

	const sessionNumber = params.sessionNumber;
	const committeeId = params.committeeId;
	const departmentId = params.departmentId;

	if (sessionNumber && !committeeId && !departmentId) {
		buttonText = `Session ${romanize(sessionNumber)} Resources`;
		buttonHref = `/medibook/sessions/${sessionNumber}/resources`;
	}

	if (committeeId && !departmentId) {
		const selectedCommittee = await prisma.committee.findFirstOrThrow({
			where: {
				OR: [
					{ id: committeeId, session: { number: sessionNumber } },
					{ slug: committeeId, session: { number: sessionNumber } },
				],
			},
			include: { session: true },
		});
		buttonText = `${selectedCommittee.name} Resources`;
		buttonHref = `/medibook/sessions/${selectedCommittee.session.number}/committees/${selectedCommittee.slug || selectedCommittee.id}/resources`;
	}

	if (departmentId && !committeeId) {
		const selectedDepartment = await prisma.department.findFirstOrThrow({
			where: {
				OR: [
					{ id: departmentId, session: { number: sessionNumber } },
					{ slug: departmentId, session: { number: sessionNumber } },
				],
			},
			include: { session: true },
		});
		buttonText = `${selectedDepartment.name} Resources`;
		buttonHref = `/medibook/sessions/${selectedDepartment.session.number}/departments/${selectedDepartment.slug || selectedDepartment.id}/resources`;
	}

	if (!selectedResource) notFound();

	return (
		<>
			<TopBar hideBackdrop hideSearchBar buttonHref={buttonHref} buttonText={buttonText} title={selectedResource.name}>
				{authorizedToEditResource(authSession, selectedResource) && (
					<>
						<SearchParamsButton color="red" searchParams={{ "delete-resource": selectedResource.id }}>
							Delete
						</SearchParamsButton>
						<SearchParamsButton searchParams={{ "edit-resource": selectedResource.id }}>Edit</SearchParamsButton>
					</>
				)}
			</TopBar>
			<ResourceViewer resourceId={selectedResource.id} />
		</>
	);
}
