import { MainWrapper } from "@/components/main-wrapper";
import { TopBar } from "@/components/top-bar";
import { connection } from "next/server";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { authorize, authorizeManagerDepartmentType, authorizeMemberDepartmentType, s } from "@/lib/authorize";
import { notFound } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Ellipsis } from "lucide-react";
import { Badge } from "@/components/badge";
import { SearchParamsDropDropdownItem, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import Paginator from "@/components/pagination";
import { getResolutionName } from "@/lib/get-resolution-name";

export default function Page(props) {
	return (
		<>
			<TopBar hideSearchBar title="Approval Panel" buttonHref="/medibook" buttonText="Home" searchText="Resolution ID..." />
			<MainWrapper>
				<Suspense fallback="Loading...">
					<ApprovalPanelPage {...props} />
				</Suspense>
			</MainWrapper>
		</>
	);
}

export async function ApprovalPanelPage(props) {
	await connection();
	const params = await props.params;
	const sessionNumber = params.sessionNumber;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	const isManager = authorize(authSession, [s.manager]);
	const isMember = authorize(authSession, [s.member]);

	if (!authSession) notFound();

	const isManagerOfAp: boolean = authorizeManagerDepartmentType(authSession?.user.currentRoles, ["APPROVAL"]);

	const isMemberOfAp: boolean = authorizeMemberDepartmentType(authSession?.user.currentRoles, ["APPROVAL"]);

	if (!isManagerOfAp && !isMemberOfAp && !isManagement) notFound();

	let ASSIGNED_TO_ME = [],
		ASSIGNED_TO_ME_LENGTH = 0,
		SENT_BACK_TO_COMMITTEE = [],
		SENT_BACK_TO_COMMITTEE_LENGTH = 0,
		SENT_TO_APPROVAL_PANEL = [],
		SENT_TO_APPROVAL_PANEL_LENGTH = 0,
		SENT_BACK_TO_MANAGER = [],
		SENT_BACK_TO_MANAGER_LENGTH = 0,
		ASSIGNED_TO_EDITOR = [],
		ASSIGNED_TO_EDITOR_LENGTH = 0;

	[ASSIGNED_TO_ME, ASSIGNED_TO_ME_LENGTH, SENT_BACK_TO_COMMITTEE, SENT_BACK_TO_COMMITTEE_LENGTH] = await prisma.$transaction([
		prisma.resolution.findMany({
			where: {
				committee: {
					session: { number: sessionNumber },
				},
				/* 				status: "ASSIGNED_TO_EDITOR",
				 */ editor: {
					userId: authSession.user.id,
				},
			},
			include: {
				committee: true,
				topic: true,
			},
		}),
		prisma.resolution.count({
			where: {
				committee: { session: { number: sessionNumber } },
				status: "ASSIGNED_TO_EDITOR",
				editor: { userId: authSession.user.id },
			},
		}),
		prisma.resolution.findMany({
			where: {
				committee: { session: { number: sessionNumber } },
				status: "SENT_BACK_TO_COMMITTEE",
			},
			include: {
				committee: true,
				topic: true,
			},
		}),
		prisma.resolution.count({
			where: {
				committee: { session: { number: sessionNumber } },
				status: "SENT_BACK_TO_COMMITTEE",
			},
		}),
		prisma.resolution.findMany({
			where: {
				committee: { session: { number: sessionNumber } },
				status: "SENT_BACK_TO_COMMITTEE",
				editor: { userId: authSession.user.id },
			},
			include: {
				committee: true,
				topic: true,
			},
		}),
		prisma.resolution.count({
			where: {
				committee: { session: { number: sessionNumber } },
				status: "SENT_BACK_TO_COMMITTEE",
				editor: { userId: authSession.user.id },
			},
		}),
	]);

	if (isManagerOfAp || isManagement) {
		[SENT_TO_APPROVAL_PANEL, SENT_TO_APPROVAL_PANEL_LENGTH] = await prisma.$transaction([
			prisma.resolution.findMany({
				where: {
					committee: {
						session: { number: sessionNumber },
					},
					status: "SENT_TO_APPROVAL_PANEL",
				},
				include: {
					committee: true,
					topic: true,
				},
			}),
			prisma.resolution.count({
				where: {
					committee: { session: { number: sessionNumber } },
					status: "SENT_TO_APPROVAL_PANEL",
				},
			}),
		]);
	}

	if (isManagerOfAp || isManagement) {
		[ASSIGNED_TO_EDITOR, ASSIGNED_TO_EDITOR_LENGTH] = await prisma.$transaction([
			prisma.resolution.findMany({
				where: {
					committee: {
						session: { number: sessionNumber },
					},
					status: "ASSIGNED_TO_EDITOR",
				},
				include: {
					committee: true,
					topic: true,
					editor: {
						include: {
							user: true,
						},
					},
				},
			}),
			prisma.resolution.count({
				where: {
					committee: { session: { number: sessionNumber } },
					status: "ASSIGNED_TO_EDITOR",
				},
			}),
		]);
	}

	[SENT_BACK_TO_MANAGER, SENT_BACK_TO_MANAGER_LENGTH] = await prisma.$transaction([
		prisma.resolution.findMany({
			where: {
				committee: {
					session: { number: sessionNumber },
				},
				status: "SENT_BACK_TO_MANAGER",
			},
			include: {
				committee: true,
				topic: true,
			},
		}),
		prisma.resolution.count({
			where: {
				committee: { session: { number: sessionNumber } },
				status: "SENT_BACK_TO_MANAGER",
			},
		}),
	]);

	return (
		<Tabs defaultValue="ASSIGNED_TO_ME">
			<div className="overflow-x-scroll showscrollbar overflow-y-hidden">
				<TabsList className="w-full flex px-3 gap-2 h-12 min-w-min max-w-max">
					{(isManagerOfAp || isManagement) && (
						<TabsTrigger value="SENT_TO_APPROVAL_PANEL">
							Waiting to be Assigned ({SENT_TO_APPROVAL_PANEL_LENGTH || "None"} Left) <Badge className="rounded-full! ml-1">Stage 1</Badge>{" "}
						</TabsTrigger>
					)}
					{(isManagerOfAp || isManagement) && (
						<TabsTrigger value="ASSIGNED_TO_EDITOR">
							Assigned To Editor ({ASSIGNED_TO_EDITOR_LENGTH || "None"} In Progress) <Badge className="rounded-full! ml-1">Stage 2 </Badge>
						</TabsTrigger>
					)}
					{(isManagerOfAp || isManagement) && (
						<TabsTrigger value="SENT_BACK_TO_MANAGER">
							Approved and Waiting ({SENT_BACK_TO_MANAGER_LENGTH || "None"} Left) <Badge className="rounded-full! ml-1">Stage 3</Badge>
						</TabsTrigger>
					)}
					<TabsTrigger value="ASSIGNED_TO_ME">Assigned to Me</TabsTrigger>
					{(isManagerOfAp || isManagement) && (
						<TabsTrigger value="SENT_BACK_TO_COMMITTEE">Returned to Committee ({SENT_BACK_TO_COMMITTEE_LENGTH || "None"} Completed)</TabsTrigger>
					)}
				</TabsList>
			</div>

			<TabsContent value="ASSIGNED_TO_ME">
				{!!ASSIGNED_TO_ME.length && (
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader>
									<span className="sr-only">Actions</span>
								</TableHeader>
								<TableHeader>Title</TableHeader>
								<TableHeader>Status</TableHeader>
								<TableHeader>Topic</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{ASSIGNED_TO_ME.map((resolution) => (
								<TableRow key={resolution.id}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain>
												<Ellipsis />
											</DropdownButton>
											<DropdownMenu>
												<DropdownItem href={`/medibook/sessions/${params.sessionNumber}/approval-panel/${resolution.id}`}>View</DropdownItem>
												{isManagement && (
													<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>
														Delete
													</SearchParamsDropDropdownItem>
												)}
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>{getResolutionName(resolution)}</TableCell>
									<TableCell>
										<Badge>{resolution.status.replaceAll("_", " ")}</Badge>
									</TableCell>
									<TableCell>{resolution.topic.title}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
				<Paginator totalItems={ASSIGNED_TO_ME_LENGTH} itemsOnPage={ASSIGNED_TO_ME.length} />
			</TabsContent>

			<TabsContent value="SENT_TO_APPROVAL_PANEL">
				{!!SENT_TO_APPROVAL_PANEL.length && (
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader>
									<span className="sr-only">Actions</span>
								</TableHeader>
								<TableHeader>Title</TableHeader>
								<TableHeader>Status</TableHeader>
								<TableHeader>Topic</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{SENT_TO_APPROVAL_PANEL.map((resolution: Resolution) => (
								<TableRow key={resolution.id}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain>
												<Ellipsis />
											</DropdownButton>
											<DropdownMenu>
												<DropdownItem href={`/medibook/sessions/${params.sessionNumber}/approval-panel/${resolution.id}`}>View & Edit</DropdownItem>
												<SearchParamsDropDropdownItem searchParams={{ "assign-to-editor": resolution.id }}>
													Assign to Editor
												</SearchParamsDropDropdownItem>
												{isManagement && (
													<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>
														Delete
													</SearchParamsDropDropdownItem>
												)}
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>{getResolutionName(resolution) || "N/A"}</TableCell>
									<TableCell>
										<Badge>{resolution.status.replaceAll("_", " ")}</Badge>
									</TableCell>
									<TableCell>{resolution.topic.title}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
				<Paginator totalItems={SENT_TO_APPROVAL_PANEL_LENGTH} itemsOnPage={SENT_TO_APPROVAL_PANEL.length} />
			</TabsContent>

			<TabsContent value="ASSIGNED_TO_EDITOR">
				{!!ASSIGNED_TO_EDITOR.length && (
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader>
									<span className="sr-only">Actions</span>
								</TableHeader>
								<TableHeader>Editor</TableHeader>
								<TableHeader>Title</TableHeader>
								<TableHeader>Status</TableHeader>
								<TableHeader>Topic</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{ASSIGNED_TO_EDITOR.map((resolution: Resolution) => (
								<TableRow key={resolution.id}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain>
												<Ellipsis />
											</DropdownButton>
											<DropdownMenu>
												<DropdownItem href={`/medibook/sessions/${params.sessionNumber}/approval-panel/${resolution.id}`}>View & Edit</DropdownItem>
												<SearchParamsDropDropdownItem searchParams={{ "approve-resolution": resolution.id }}>Approve</SearchParamsDropDropdownItem>
												<SearchParamsDropDropdownItem searchParams={{ "remove-from-editor": resolution.id }}>
													Remove from Editor
												</SearchParamsDropDropdownItem>
												{isManagement && (
													<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>
														Delete
													</SearchParamsDropDropdownItem>
												)}
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>
										<UserTooltip userId={resolution.editor.userId}>
											{resolution.editor.user.displayName || `${resolution.editor.user.officialName} ${resolution.editor.user.officialSurname}`}
										</UserTooltip>
									</TableCell>
									<TableCell>{getResolutionName(resolution) || "N/A"}</TableCell>
									<TableCell>
										<Badge>{resolution.status.replaceAll("_", " ")}</Badge>
									</TableCell>
									<TableCell>{resolution.topic.title}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
				<Paginator totalItems={ASSIGNED_TO_EDITOR_LENGTH} itemsOnPage={ASSIGNED_TO_EDITOR.length} />
			</TabsContent>

			<TabsContent value="SENT_BACK_TO_COMMITTEE">
				{!!SENT_BACK_TO_COMMITTEE.length && (
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader>
									<span className="sr-only">Actions</span>
								</TableHeader>
								<TableHeader>Title</TableHeader>
								<TableHeader>Status</TableHeader>
								<TableHeader>Topic</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{SENT_BACK_TO_COMMITTEE.map((resolution: Resolution) => (
								<TableRow key={resolution.id}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain>
												<Ellipsis />
											</DropdownButton>
											<DropdownMenu>
												<DropdownItem href={`/medibook/sessions/${params.sessionNumber}/approval-panel/${resolution.id}`}>View & Edit</DropdownItem>
												{isManagement && (
													<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>
														Delete
													</SearchParamsDropDropdownItem>
												)}
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>{getResolutionName(resolution) || "N/A"}</TableCell>
									<TableCell>
										<Badge>{resolution.status.replaceAll("_", " ")}</Badge>
									</TableCell>
									<TableCell>{resolution.topic.title}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
				<Paginator totalItems={SENT_BACK_TO_COMMITTEE_LENGTH} itemsOnPage={SENT_BACK_TO_COMMITTEE.length} />
			</TabsContent>
			<TabsContent value="SENT_BACK_TO_MANAGER">
				{!!SENT_BACK_TO_MANAGER.length && (
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader>
									<span className="sr-only">Actions</span>
								</TableHeader>
								<TableHeader>Title</TableHeader>
								<TableHeader>Status</TableHeader>
								<TableHeader>Topic</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{SENT_BACK_TO_MANAGER.map((resolution: Resolution) => (
								<TableRow key={resolution.id}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain>
												<Ellipsis />
											</DropdownButton>
											<DropdownMenu>
												<SearchParamsDropDropdownItem searchParams={{ "send-resolution-back-to-committee": resolution.id }}>
													Send Back to Committee
												</SearchParamsDropDropdownItem>
												<DropdownItem href={`/medibook/sessions/${params.sessionNumber}/approval-panel/${resolution.id}`}>View & Edit</DropdownItem>
												{isManagement && (
													<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>
														Delete
													</SearchParamsDropDropdownItem>
												)}
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>{getResolutionName(resolution) || "N/A"}</TableCell>
									<TableCell>
										<Badge>{resolution.status.replaceAll("_", " ")}</Badge>
									</TableCell>
									<TableCell>{resolution.topic.title}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
				<Paginator totalItems={SENT_BACK_TO_MANAGER_LENGTH} itemsOnPage={SENT_BACK_TO_MANAGER.length} />
			</TabsContent>
		</Tabs>
	);
}
