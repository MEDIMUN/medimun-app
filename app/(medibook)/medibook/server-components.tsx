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
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { Subheading } from "@/components/heading";
import { PageCreateAnnouncement } from "./@announcement/pageCreateAnnouncement";

const columns = ["Name", "Uploader", "Date Uploaded", "Tags"];

export async function ResourcesTable({ resources, isManagement, tableColumns = columns }) {
	const authSession = await auth();
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
															{capitaliseEachWord(scope.replace("SESSION", ""))} (Session {romanize(resource?.session?.number)})
														</Badge>
													);
												}
												if (scope.includes("COMMITTEE")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{capitaliseEachWord(scope.replace("COMMITTEE", ""))} viewing{" "}
															{resource?.committee?.shortName || resource?.committee?.name} in Session {romanize(resource?.committee?.session.number)}
														</Badge>
													);
												}
												if (scope.includes("DEPARTMENT")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{capitaliseEachWord(scope.replace("DEPARTMENT", ""))} viewing{" "}
															{resource?.department?.shortName || resource?.department?.name} in Session{" "}
															{romanize(resource?.department?.session.number)}
														</Badge>
													);
												}
												if (scope.includes("PERSONAL")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{capitaliseEachWord(scope)}
														</Badge>
													);
												}
												return (
													<Badge key={index} color="purple" className="max-w-min">
														{capitaliseEachWord(scope)}
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
				<ul className="grid grid-flow-row gap-6">
					{announcements.map((announcement, index) => {
						const fullName = announcement.user.displayName || `${announcement.user.officialName} ${announcement.user.officialSurname}`;
						const url = `${baseUrl}/${announcement.id}${announcement.slug ? "/" : ""}${announcement.slug ? announcement.slug : ""}`;
						const isTimeSame = announcement.time.toLocaleTimeString() == announcement.editTime.toLocaleTimeString();
						return (
							<li className="rounded-md bg-zinc-100 p-4" key={announcement.id}>
								<div className="flex gap-2">
									<div className="max-w-auto w-full">
										<Link href={url} className="!cursor-pointer hover:underline">
											<h3 className="text-base/6 font-semibold">{announcement.title}</h3>
										</Link>
										<Text className="mb-2 line-clamp-1">{announcement.description}</Text>
										<Text className="line-clamp-2">{processMarkdownPreview(announcement.markdown)}</Text>
										<div className="mt-2 flex flex-wrap gap-2 md:flex-row">
											<Badge className="max-w-max px-2">
												{announcement?.privacy === "ANONYMOUS" && (isManagement ? `${fullName} (Anonymous)` : "Anonymous")}
												{announcement?.privacy === "BOARD" && (isManagement ? `${fullName} (Anonymous - Board of Directors)` : "Board of Directors")}
												{announcement?.privacy === "NORMAL" && fullName}
												{announcement?.privacy === "SECRETARIAT" && (isManagement ? `${fullName} (Secretariat)` : "Secretariat")}
											</Badge>
											{isTimeSame ? (
												<Badge className="max-w-max px-2">{announcement.time.toLocaleString("uk").replace(",", " -")}</Badge>
											) : (
												<Badge className="max-w-max px-2">Edited {announcement.editTime.toLocaleString("uk").replace(",", " -")}</Badge>
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
	const selectedAnnouncement = await prisma.announcement.findUnique({
		where: {
			id: params.announcementId[0],
		},
		include: {
			session: true,
			committee: { include: { session: true } },
			department: { include: { session: true } },
			user: true,
		},
	});

	let baseUrl = "/medibook/announcements";
	let buttonText = "";
	let buttonHref = "";
	let createType: "globalAnnouncement" | "sessionAnnouncement" | "committeeAnnouncement" | "departmentAnnouncement" = "globalAnnouncement";

	if (params.sessionNumber && !params.committeeId && !params.departmentId) {
		const selectedSession = await prisma.session.findUnique({
			where: {
				number: params.sessionNumber,
			},
		});
		baseUrl = `/medibook/sessions/${selectedSession.number}/announcements`;
		buttonText = `Session ${romanize(selectedSession.numberInteger)} Announcements`;
		buttonHref = `/medibook/sessions/${selectedSession.number}`;
		createType = "sessionAnnouncement";
	}

	if (params.committeeId && !params.departmentId && params.sessionNumber) {
		const selectedCommittee = await prisma.committee.findFirstOrThrow({
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
		buttonHref = `/medibook/sessions/${selectedCommittee.session.number}/committees/${selectedCommittee.slug || selectedCommittee.id}`;
		createType = "committeeAnnouncement";
	}

	if (params.departmentId && !params.committeeId && params.sessionNumber) {
		const selectedDepartment = await prisma.department.findFirstOrThrow({
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
		return <PageCreateAnnouncement returnUrl={baseUrl} type={createType} />;
	}

	if (searchParams["edit-announcement"]) {
		return null;
	}

	if (!selectedAnnouncement) return;

	return (
		<div className="pt-24 sm:pt-32">
			<div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
				<p className="mx-auto mb-8 mt-2 max-w-lg text-pretty text-center text-4xl font-medium tracking-tight text-gray-950 sm:text-3xl">
					{selectedAnnouncement.title}
				</p>
				<Suspense fallback={<div>404</div>}>
					{/* @ts-ignore */}
					<MDXRemote components={{ ...announcementWebsitecomponents }} source={selectedAnnouncement.markdown} />
				</Suspense>
				<Divider className="mt-[712px]" />
				<Subheading className="my-10 !font-extralight">
					{"We are not responsible for the contents of announcements. Please refer to our "}
					<Link className="underline hover:text-primary" href="/conduct#announcements" target="_blank">
						code of conduct
					</Link>
					{" and "}
					<Link className="underline hover:text-primary" href="/conduct#announcements" target="_blank">
						terms of service
					</Link>
					{" for more information."}
				</Subheading>
			</div>
		</div>
	);
}
