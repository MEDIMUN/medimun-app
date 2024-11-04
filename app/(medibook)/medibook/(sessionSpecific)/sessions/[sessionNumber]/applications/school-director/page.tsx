import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { Divider } from "@/components/divider";
import { Dropdown, DropdownButton, DropdownDescription, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import { Description, Field, Label } from "@/components/fieldset";
import { Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import Paginator from "@/components/pagination";
import { Select } from "@/components/select";
import { Switch, SwitchField } from "@/components/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Text } from "@/components/text";
import { authorize, s } from "@/lib/authorize";
import { parseOrderDirection } from "@/lib/order-direction";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { notFound } from "next/navigation";
import { ApplicationOptions } from "./client-components";

const itemsPerPage = 10;

const sortOptions = [
	{ value: "date", order: "asc", label: "Date Applied" },
	{ value: "date", order: "desc", label: "Date Applied" },
	{ value: "isApproved", order: "asc", label: "Status" },
	{ value: "isApproved", order: "desc", label: "Status" },
	{ value: "bestTimeToReach", order: "asc", label: "Best Time to Reach" },
	{ value: "bestTimeToReach", order: "desc", label: "Best Time to Reach" },
];

export function areSchoolDirectorApplicationsOpen(selectedSession) {
	if (!selectedSession) return false;
	//if not current session
	if (!selectedSession.isCurrent) return false;
	//if force open is on
	if (selectedSession.isSchoolDirectorApplicationsForceOpen) return true;
	//if auto closed or not auto open
	if (!selectedSession.isSchoolDirectorApplicationsAutoOpen) return false;
	const now = new Date();
	return selectedSession.schoolDirectorApplicationsAutoOpenTime < now && selectedSession.schoolDirectorApplicationsAutoCloseTime > now;
}

export default async function SchoolDirectorApplicationsPage(props: { params: Promise<{ sessionNumber: string }>; searchParams: Promise<any> }) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.sd])) return notFound();

	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "date";
	const orderDirection = parseOrderDirection(searchParams.direction, "desc");

	const [selectedSession, applications] = await prisma
		.$transaction([
			prisma.session.findFirst({ where: { number: params.sessionNumber } }),
			prisma.applicationSchoolDirector.findMany({
				where: {
					session: { number: params.sessionNumber },
					school: { name: { contains: query, mode: "insensitive" } },
				},
				orderBy: { [orderBy]: orderDirection },
				include: { school: true, user: { include: { schoolDirector: { include: { school: true, session: true } } } } },
				skip: (currentPage - 1) * itemsPerPage,
				take: itemsPerPage,
			}),
		])
		.catch(notFound);

	const areApplicationsOpen = areSchoolDirectorApplicationsOpen(selectedSession);

	return (
		<>
			<TopBar
				sortOptions={sortOptions}
				defaultSort="datedesc"
				buttonText={`Session ${romanize(parseInt(params.sessionNumber))} Applications`}
				buttonHref={`/medibook/sessions/${params.sessionNumber}/applications`}
				title="School Director Applications"
			/>
			<div className="rounded-md bg-zinc-950/5 p-4 ring-1 ring-zinc-950/10">
				<Text>{areApplicationsOpen ? "Applications are currently open." : "Applications are currently closed."}</Text>
			</div>
			<ApplicationOptions selectedSession={selectedSession} />
			{!!applications.length && (
				<Table className="showscrollbar">
					<TableHead>
						<TableRow>
							<TableHeader>
								<span className="sr-only">Actions</span>
							</TableHeader>
							<TableHeader>Status</TableHeader>
							<TableHeader>Official Name</TableHeader>
							<TableHeader>Official Surname</TableHeader>
							<TableHeader>Email</TableHeader>
							<TableHeader>School</TableHeader>
							<TableHeader>Previous School Director Roles</TableHeader>
							<TableHeader>Best Time to Reach</TableHeader>
							<TableHeader>Date Applied</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{applications.map((application) => {
							return (
								<TableRow key={application.id}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain>
												<EllipsisVerticalIcon />
											</DropdownButton>
											<DropdownMenu>
												<DropdownItem href={`/medibook/schools/${application.school.slug || application.school.id}`}>View School</DropdownItem>
												<DropdownItem href={`/medibook/users/${application.user.username || application.user.id}`}>View User</DropdownItem>
												{!application.isApproved && (
													<>
														<SearchParamsDropDropdownItem searchParams={{ "approve-school-director-application": application.id }}>
															Approve
														</SearchParamsDropDropdownItem>
														<SearchParamsDropDropdownItem searchParams={{ "delete-school-director-application": application.id }}>
															Delete
														</SearchParamsDropDropdownItem>
													</>
												)}
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>{application.isApproved ? <Badge color="green">Approved</Badge> : <Badge color="yellow">Pending</Badge>}</TableCell>
									<TableCell>{application.user.officialName}</TableCell>
									<TableCell>{application.user.officialSurname}</TableCell>
									<TableCell>{application.user.email}</TableCell>
									<TableCell>
										<Link href={`/medibook/schools/${application.school.slug || application.school.id}`}>{application.school.name}</Link>
									</TableCell>
									<TableCell>
										{application.user.schoolDirector.length == 0 ? "None" : application.user.schoolDirector.length} Role
										{application.user.schoolDirector.length == 1 ? "" : "s"}
										{!!application.user.schoolDirector.length && (
											<Dropdown>
												<DropdownButton className="ml-2" plain>
													View
												</DropdownButton>
												<DropdownMenu>
													{application.user.schoolDirector.map((sd) => {
														return (
															<DropdownItem key={Math.random()} href={`/medibook/sessions/${sd.session.number}`}>
																<DropdownLabel>{sd.school.name}</DropdownLabel>
																<DropdownDescription>
																	Session {romanize(sd.session.numberInteger)} ({sd.session.number})
																</DropdownDescription>
															</DropdownItem>
														);
													})}
												</DropdownMenu>
											</Dropdown>
										)}
									</TableCell>
									<TableCell>{application.user.bestTimeToReach || "-"}</TableCell>
									<TableCell>{application.date.toLocaleString("en-GB").replace(",", " at ")}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}
			<Paginator
				itemsOnPage={applications.length}
				itemsPerPage={itemsPerPage}
				totalItems={await prisma.applicationSchoolDirector.count({ where: { session: { number: params.sessionNumber } } })}
			/>
		</>
	);
}
