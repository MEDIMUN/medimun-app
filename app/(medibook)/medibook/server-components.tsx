import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { SearchParamsButton, SessionResourceDropdown, TopBar } from "./client-components";
import { FastLink as Link } from "@/components/fast-link";
import { Badge } from "@/components/badge";
import { romanize } from "@/lib/romanize";
import { capitaliseEachWord } from "@/lib/text";
import { authorizedToEditResource } from "./@resourceModals/default";
import { auth } from "@/auth";

import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
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

export async function ResourceViewPage(props) {
	await connection();
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
