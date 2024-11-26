import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Button } from "@/components/button";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { Committee } from "@prisma/client";
import { notFound } from "next/navigation";
import { SubmissionOptions } from "./client-components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Avatar } from "@nextui-org/avatar";
import { countries } from "@/data/countries";
import { Badge } from "@/components/badge";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import Paginator from "@/components/pagination";
import { Subheading } from "@/components/heading";
import { Text, TextLink } from "@/components/text";

export function arePositionPaperSubmissionsOpen(selectedCommittee: Committee) {
	if (!selectedCommittee) return false;
	//if not current session
	if (selectedCommittee.isPositionPaperSubmissionForceOpen) return true;
	//if auto closed or not auto open
	if (!selectedCommittee.isPositionPaperSubmissionAutoOpen) return false;
	const now = new Date();

	if (!selectedCommittee.positionPaperSubmissionAutoOpenTime || !selectedCommittee.positionPaperSubmissionAutoCloseTime) return false;
	return selectedCommittee.positionPaperSubmissionAutoOpenTime < now && selectedCommittee.positionPaperSubmissionAutoCloseTime > now;
}

export const statusMap = {
	APPROVED: {
		name: "Accepted & Returned",
		color: "green",
	},
	PENDING: {
		name: "Pending",
		color: "yellow",
	},
	REVISION: {
		name: "Revision Requested",
		color: "blue",
	},
	REJECTED: {
		name: "Rejected & Returned",
		color: "red",
	},
};

export default async function Page(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;
	const authSession = await auth();
	if (!authSession) notFound();
	let positionPapers = [] as any;
	const query = searchParams.search || "";
	let positionPapersVisibleToDelegate = [];
	let positionPapersOfDelegate = [];

	const isManagement = authorize(authSession, [s.management]);

	const selectedCommittee = await prisma.committee
		.findFirstOrThrow({
			where: {
				OR: [{ slug: params.committeeId }, { id: params.committeeId }],
				session: { number: params.sessionNumber, ...(!isManagement ? { isPartlyVisible: true } : {}) },
				...(isManagement ? {} : { isVisible: true }),
			},
			include: {
				ExtraCountry: true,
			},
		})
		.catch(notFound);

	const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee?.id);
	const isDelegateOfCommittee = authorizeDelegateCommittee(authSession?.user.currentRoles, selectedCommittee?.id);
	const areSubmissionsOpen = arePositionPaperSubmissionsOpen(selectedCommittee);

	const otherPositionPapersOfDelegate = await prisma.positionPaper.findMany({
		where: { userId: authSession.user.id, committeeId: selectedCommittee.id },
		orderBy: { index: "desc" },
		take: 1,
	});

	const isManagementOrChair = isManagement || isChairOfCommittee;

	let lastPositionPaper = null as any,
		totalPositionPapers = 0;
	if (otherPositionPapersOfDelegate.length > 0) lastPositionPaper = otherPositionPapersOfDelegate[0];
	const canSubmit = (!!lastPositionPaper && ["REVISION"].includes(lastPositionPaper?.status)) || otherPositionPapersOfDelegate.length == 0;

	if (isManagementOrChair) {
		positionPapers = await prisma.positionPaper.findMany({
			where: {
				committeeId: selectedCommittee.id,
				user: {
					OR: [
						{ officialName: { contains: query, mode: "insensitive" } },
						{ officialSurname: { contains: query, mode: "insensitive" } },
						{ displayName: { contains: query, mode: "insensitive" } },
						{ id: { contains: query, mode: "insensitive" } },
						{ Student: { name: { contains: query, mode: "insensitive" } } },
					],
				},
			},
			orderBy: [{ index: "asc" }, { userId: "asc" }],
			include: { user: { include: { delegate: { where: { committeeId: selectedCommittee.id } } } } },
		});
		totalPositionPapers = await prisma.positionPaper.count({
			where: {
				committeeId: selectedCommittee.id,
				user: {
					OR: [
						{ officialName: { contains: query, mode: "insensitive" } },
						{ officialSurname: { contains: query, mode: "insensitive" } },
						{ displayName: { contains: query, mode: "insensitive" } },
						{ id: { contains: query, mode: "insensitive" } },
						{ Student: { name: { contains: query, mode: "insensitive" } } },
					],
				},
			},
		});
	}

	const allCountries = countries.concat(selectedCommittee?.ExtraCountry || []);

	if (selectedCommittee.isPositionPapersVisible) {
		positionPapersVisibleToDelegate = await prisma.positionPaper.findMany({
			where: {
				committeeId: selectedCommittee.id,
				user: {
					id: { not: authSession.user.id },
					OR: [
						{ officialName: { contains: query, mode: "insensitive" } },
						{ officialSurname: { contains: query, mode: "insensitive" } },
						{ displayName: { contains: query, mode: "insensitive" } },
						{ id: { contains: query, mode: "insensitive" } },
						{ Student: { name: { contains: query, mode: "insensitive" } } },
					],
				},
				status: { in: ["APPROVED"] },
			},
			orderBy: [{ index: "asc" }, { userId: "asc" }],
			include: { user: { include: { delegate: { where: { committeeId: selectedCommittee.id } } } } },
		});
	}

	if (!isChairOfCommittee && !isManagement && isDelegateOfCommittee) {
		positionPapersOfDelegate = await prisma.positionPaper.findMany({
			where: {
				committeeId: selectedCommittee.id,
				userId: authSession.user.id,
			},
			include: {
				resource: true,
			},
			orderBy: { index: "asc" },
		});
	}

	return (
		<>
			<TopBar
				hideBackdrop
				hideSearchBar={!(isChairOfCommittee || isManagement) && !selectedCommittee.isPositionPapersVisible}
				buttonHref={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}`}
				buttonText={selectedCommittee.name}
				title="Position Papers">
				{isDelegateOfCommittee && canSubmit && isDelegateOfCommittee && !isManagement && !isChairOfCommittee && (
					<SearchParamsButton disabled={!areSubmissionsOpen} searchParams={{ "submit-position-paper": true }}>
						Submit New Position Paper
					</SearchParamsButton>
				)}
			</TopBar>
			<div className="rounded-md bg-zinc-950/5 p-4">
				<Text>{areSubmissionsOpen ? "Submissios are currently open." : "Submissions are currently closed."}</Text>
				{selectedCommittee?.positionPaperSubmissionAutoCloseTime && selectedCommittee.isPositionPaperSubmissionAutoOpen && (
					<Text className="!text-xs">
						You can submit a position paper {selectedCommittee?.positionPaperSubmissionAutoOpenTime && ` starting from `}
						{selectedCommittee?.positionPaperSubmissionAutoOpenTime?.toLocaleString("en-GB")?.replace(", ", " at ")} until{" "}
						{selectedCommittee?.positionPaperSubmissionAutoCloseTime?.toLocaleString("en-GB")?.replace(", ", " at ")}.
					</Text>
				)}
			</div>
			{isManagementOrChair && (
				<>
					<SubmissionOptions selectedCommittee={selectedCommittee} />
					{!!positionPapers.length && (
						<Table className="showscrollbar">
							<TableHead>
								<TableRow>
									<TableHeader>
										<span className="sr-only">Actions</span>
									</TableHeader>
									<TableHeader>
										<span className="sr-only">Avatar</span>
									</TableHeader>
									<TableHeader>Official Name</TableHeader>
									<TableHeader>Official Surname</TableHeader>
									<TableHeader>Display Name</TableHeader>
									<TableHeader>Delegation Country</TableHeader>
									<TableHeader>Status</TableHeader>
									<TableHeader>Submission Date</TableHeader>
								</TableRow>
							</TableHead>
							<TableBody>
								{positionPapers.map((paper) => {
									const user = paper.user;
									const selectedCountry = allCountries.find((country) => country.countryCode === user?.delegate[0].country);
									return (
										<TableRow key={paper.id}>
											<TableCell>
												<Dropdown>
													<DropdownButton plain>
														<EllipsisHorizontalIcon />
													</DropdownButton>
													<DropdownMenu>
														<DropdownItem
															href={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/position-papers/${paper.id}`}>
															View
														</DropdownItem>
														<SearchParamsDropDropdownItem searchParams={{ "return-position-paper": paper.id }}>Return</SearchParamsDropDropdownItem>
														<SearchParamsDropDropdownItem searchParams={{ "delete-position-paper": paper.id }}>Delete</SearchParamsDropDropdownItem>
													</DropdownMenu>
												</Dropdown>
											</TableCell>
											<TableCell>
												<Avatar showFallback radius="md" src={`/api/avatars/${paper.user?.id}/avatar`} />
											</TableCell>
											<TableCell>{user.officialName || "-"}</TableCell>
											<TableCell>{user.officialSurname || "-"}</TableCell>
											<TableCell>{user.displayName || "-"}</TableCell>
											<TableCell>{selectedCountry?.countryNameEn || "-"}</TableCell>
											<TableCell>
												<Badge color={statusMap[paper.status].color}>{statusMap[paper.status].name}</Badge>
											</TableCell>
											<TableCell>{paper.createdAt.toLocaleString("en-GB").replace(", ", " at ")}</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
					<Paginator itemsOnPage={positionPapers.length} totalItems={totalPositionPapers} />
				</>
			)}

			{isDelegateOfCommittee && !isManagement && !isChairOfCommittee && (
				<div className="bg-zinc-100 p-4 rounded-md">
					<Text>My Position Papers</Text>
					{!!positionPapersOfDelegate.length ? (
						<Table className="showscrollbar">
							<TableHead>
								<TableRow>
									<TableHeader>
										<span className="sr-only">Actions</span>
									</TableHeader>
									<TableHeader>Resource Name</TableHeader>
									<TableHeader>Status</TableHeader>
									<TableHeader>Submission Date</TableHeader>
									<TableHeader>Return Date</TableHeader>
								</TableRow>
							</TableHead>
							<TableBody>
								{positionPapersOfDelegate.map((paper, index) => {
									return (
										<TableRow key={paper.id}>
											<TableCell>
												<Button
													plain
													href={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/position-papers/${paper.id}`}>
													View Details
												</Button>
											</TableCell>
											<TableCell>{paper.resource?.name || "-"}</TableCell>
											<TableCell>
												<Badge color={statusMap[paper.status].color}>{statusMap[paper.status].name}</Badge>
											</TableCell>
											<TableCell>{paper.createdAt.toLocaleString("en-GB").replace(", ", " at ")}</TableCell>
											<TableCell>{paper.returnTime?.toLocaleString("en-GB").replace(", ", " at ") || "-"}</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					) : (
						<div className="text-center rounded-lg p-4 m-4 max-w-max mx-auto">
							<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="mx-auto size-12 text-gray-400">
								<path
									d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
									strokeWidth={2}
									vectorEffect="non-scaling-stroke"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<h3 className="mt-2 text-sm font-semibold text-gray-900">No Submissions</h3>
							<p className="mt-1 text-sm text-gray-500">No position papers have been submitted by you for this committee.</p>
							<div className="mt-6">
								<SearchParamsButton disabled={!areSubmissionsOpen} searchParams={{ "submit-position-paper": true }}>
									Submit New
								</SearchParamsButton>
							</div>
						</div>
					)}
				</div>
			)}
			{isDelegateOfCommittee && selectedCommittee.isPositionPapersVisible && !isManagement && !isChairOfCommittee && (
				<>
					{!!positionPapersVisibleToDelegate.length && (
						<>
							<Table className="showscrollbar">
								<TableHead>
									<TableRow>
										<TableHeader>
											<span className="sr-only">Actions</span>
										</TableHeader>
										<TableHeader>Delegation</TableHeader>
										<TableHeader>Full Name</TableHeader>
									</TableRow>
								</TableHead>
								<TableBody>
									{positionPapersVisibleToDelegate.map((paper) => {
										const user = paper.user;
										const selectedCountry = allCountries.find((country) => country.countryCode === user?.delegate[0].country);
										const fullName = user.displayName || `${user.officialName} ${user.officialSurname}`;
										return (
											<TableRow key={paper.id}>
												<TableCell>
													<Button
														plain
														href={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/position-papers/${paper.id}`}>
														View
													</Button>
												</TableCell>

												<TableCell>{selectedCountry?.countryNameEn || "-"}</TableCell>
												<TableCell>
													<UserTooltip userId={user.id}>
														<div className="flex gap-2">
															<Avatar className="w-5 h-5 my-auto rounded-sm" showFallback radius="md" src={`/api/users/${user?.id}/avatar`} />
															{fullName || "-"}
														</div>
													</UserTooltip>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
							<Paginator itemsOnPage={positionPapersVisibleToDelegate.length} totalItems={totalPositionPapers} />
						</>
					)}
				</>
			)}
		</>
	);
}
