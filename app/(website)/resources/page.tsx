import { SessionResourceDropdown } from "@/app/(medibook)/medibook/client-components";
import { Badge } from "@/components/badge";
import Paginator from "@/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { romanize } from "@/lib/romanize";
import { capitaliseEachWord } from "@/lib/text";
import prisma from "@/prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Topbar } from "../server-components";

function PublicResourcesTable({ resources }) {
	const tableColumns = ["Name", "Date Uploaded", "Tags"];

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
														{capitaliseEachWord(scope.replace("COMMITTEE", ""))} viewing {resource?.committee?.shortName || resource?.committee?.name}{" "}
														in Session {romanize(resource?.committee?.session.number)}
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

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const currentPage = Number(searchParams.page) || 1;
	const whereObject = {
		isPrivate: false,
		OR: [
			{ scope: { hasSome: ["WEBSITE"] } },
			{ session: { isMainShown: true }, scope: { hasSome: ["SESSIONPROSPECTUS"] } },
			{ session: { isMainShown: true }, scope: { hasSome: ["SESSIONWEBSITE"] } },
		],
	};

	const [resources, totalItems] = await prisma
		.$transaction([
			prisma.resource.findMany({
				where: whereObject as any,
				orderBy: {
					time: "desc",
				},
				take: 20,
				skip: (currentPage - 1) * 20,
			}),
			prisma.resource.count({ where: whereObject as any }),
		])
		.catch(notFound);

	return (
		<>
			<Topbar
				title={"Files & Resources"}
				description={
					"Access essential global files and resources to support your experience. For materials specific to a session, check the relevant session page for more details."
				}
			/>
			<PublicResourcesTable resources={resources}></PublicResourcesTable>
			<Paginator totalItems={totalItems} itemsOnPage={resources.length} itemsPerPage={20} />
		</>
	);
}

const researchBooklets = [
	{ name: "General Assembly 1", href: "https://drive.google.com/file/d/1uye5uwpkvhsBtJV7bIN4zDnKDjgLHUG2/view?usp=sharing" },
	{ name: "General Assembly 2", href: "https://drive.google.com/file/d/1Z5OvpZd3elmJ_c6v1tk8WCuO9RjWPN_Z/view?usp=sharing" },
	{ name: "General Assembly 3", href: "https://drive.google.com/file/d/16_SYkqQeRVIBbWUnYnWvCW3kPN7gBeEb/view?usp=sharing" },
	{ name: "General Assembly 4", href: "https://drive.google.com/file/d/1UOVvLd80sLPkHkvAF1ShUgWz2UqfOe47/view?usp=sharing" },
	{ name: "Security Council", href: "https://drive.google.com/file/d/1FBAv5s9VfFcTzERZiumOax8gldxLkCT_/view?usp=sharing" },
	{ name: "Historical Security Council", href: "https://drive.google.com/file/d/1x9GADBXTiMFeBCAukIzo-700SMsBznDS/view?usp=sharing" },
	{ name: "Commission on the Status of Women", href: "https://drive.google.com/file/d/1YNRKOvia9_r0LzLdIRH5LDAdxkDGzrQe/view?usp=sharing" },
];
