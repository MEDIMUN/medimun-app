import { auth } from "@/auth";
import { MainWrapper } from "@/components/main-wrapper";
import { TopBar } from "@/components/top-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, authorizeManagerDepartmentType, authorizeMemberDepartmentType, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { countries } from "@/data/countries";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@/components/badge";
import { Heading, Subheading } from "@/components/heading";
import Paginator from "@/components/pagination";
import { SearchParamsButton } from "@/app/(medibook)/medibook/client-components";
import { EditCoSubmitter } from "./_components/edit-co-submitter";
import { SubmitResolutionToChairsButton } from "./_components/submit-resolution-to-chairs-button";
import type { Clause, OperativePhrases, PreambulatoryPhrases } from "@/types/socket-events";
import { ResolutionEditor } from "../../components/resolution-editor";
import { Suspense } from "react";
import { canEditResolution } from "@/lib/resolution-open-mode";
import ResolutionDisplay from "@/components/resolution-display";
import { getResolutionName } from "@/lib/get-resolution-name";
import { AutoRefresh } from "@/components/auto-refresh";
import { ResoPageTopbar } from "./_components/topbar";
import { SubmitApproveResolutionToManagerAP } from "./_components/approve-resolution-button";
import { SendBackToCommitteeButton } from "./_components/send-back-to-committee-button";
import { RefreshTabList } from "./_components/tablist-client";

type selectedResolution = Prisma.ResolutionGetPayload<{
	include: {
		committee: {
			include: {
				session: true;
			};
		};
		mainSubmitter: {
			include: {
				user: true;
			};
		};
		PreambulatoryClause: true;
		OperativeClause: true;
		CoSubmitterInvitation: {
			include: {
				delegate: {
					include: {
						user: true;
					};
				};
			};
		};
		CoSubmitters: {
			include: {
				delegate: {
					include: {
						user: true;
					};
				};
			};
		};
		topic: true;
	};
}>;

export default async function ResolutionPageGA(props) {
	const authSession = await auth();
	if (!authSession) return notFound();
	const isManagement = authorize(authSession, [s.management]);
	const params = await props.params;

	const selectedResolution = await prisma.resolution
		.findUnique({
			where: { id: params["resolutionId"] },
			include: {
				committee: { include: { session: true } },
				PreambulatoryClause: { orderBy: { index: "asc" } },
				OperativeClause: { orderBy: { index: "asc" } },
				CoSubmitterInvitation: { include: { delegate: { include: { user: true } } } },
				mainSubmitter: { include: { user: true } },
				editor: { include: { user: true } },
				CoSubmitters: { include: { delegate: { include: { user: true } } } },
				topic: true,
			},
		})
		.catch((e) => console.error(e.stack));

	if (!selectedResolution) return notFound();

	let allowedToApprove = false;
	let isAllowedToSendBackToCommittee = false;

	const isAPManager = authorizeManagerDepartmentType(authSession.user.currentRoles, ["APPROVAL"]);
	const isAPMember = authorizeMemberDepartmentType(authSession.user.currentRoles, ["APPROVAL"]);

	if (isAPManager && ["ASSIGNED_TO_EDITOR", "SENT_TO_APPROVAL_PANEL"].includes(selectedResolution?.status)) {
		allowedToApprove = true;
	}

	if ((isAPManager || isManagement) && ["ASSIGNED_TO_EDITOR", "SENT_TO_APPROVAL_PANEL", "SENT_BACK_TO_MANAGER"].includes(selectedResolution.status)) {
		isAllowedToSendBackToCommittee = true;
	}

	if (isManagement && ["ASSIGNED_TO_EDITOR", "SENT_TO_APPROVAL_PANEL"].includes(selectedResolution.status)) {
		allowedToApprove = true;
	}

	if (isAPMember && ["ASSIGNED_TO_EDITOR"].includes(selectedResolution.status)) {
		if (selectedResolution.editor?.userId === authSession.user.id) allowedToApprove = true;
	}

	if (!selectedResolution) return notFound();

	const totalCosubmitters = selectedResolution.CoSubmitters.length + selectedResolution.CoSubmitterInvitation.length;

	const mode = canEditResolution(authSession, selectedResolution);
	const isMainSubmitter = selectedResolution.mainSubmitter.userId === authSession.user.id;

	if (mode == "EDIT") {
		return (
			<EditGAResolution
				isAllowedToSendBackToCommittee={isAllowedToSendBackToCommittee}
				allowedToApprove={allowedToApprove}
				totalCosubmitters={totalCosubmitters}
				isMainSubmitter={isMainSubmitter}
				selectedResolution={selectedResolution}
			/>
		);
	} else if (mode == "VIEW") {
		return (
			<>
				<ResoPageTopbar
					hideSearchBar
					buttonHref={`/medibook/sessions/${selectedResolution.committee.session.number}/committees/${selectedResolution.committee.slug || selectedResolution.committee.id}/resolutions`}
					buttonText={`${selectedResolution.committee.name} Resolutions`}
					title={getResolutionName(selectedResolution)}
					subheading={selectedResolution.topic.title}></ResoPageTopbar>
				<ResolutionDisplay preambutoryClauses={selectedResolution.PreambulatoryClause} operativeClauses={selectedResolution.OperativeClause} />
			</>
		);
	} else {
		return notFound();
	}

	function convertToClause(clause: any): Clause {
		return {
			id: clause.id,
			index: clause.index,
			startingPhrase: clause.startingPhrase as PreambulatoryPhrases | OperativePhrases,
			body: clause.body,
			subClauses: clause.subClauses ? JSON.parse(clause.subClauses) : [],
			resolutionId: clause.resolutionId,
		};
	}

	function EditGAResolution({
		selectedResolution,
		isMainSubmitter,
		totalCosubmitters,
		allowedToApprove = false,
		isAllowedToSendBackToCommittee = false,
	}: {
		selectedResolution: selectedResolution;
		isMainSubmitter: boolean;
		totalCosubmitters: number;
		allowedToApprove?: boolean;
		isAllowedToSendBackToCommittee?: boolean;
	}) {
		const allCosubmitters = [...(selectedResolution.CoSubmitters || []), ...(selectedResolution.CoSubmitterInvitation || [])];

		const preambutoryClauses = selectedResolution.PreambulatoryClause.map(convertToClause);
		const operativeClauses = selectedResolution.OperativeClause.map(convertToClause);

		return (
			<RefreshTabList>
				<ResoPageTopbar
					hideSearchBar
					buttonHref={`/medibook/sessions/${selectedResolution.committee.session.number}/committees/${selectedResolution.committee.slug || selectedResolution.committee.id}/resolutions`}
					buttonText={`${selectedResolution.committee.name} Resolutions`}
					title={getResolutionName(selectedResolution) || selectedResolution.title}
					subheading={selectedResolution.topic.title}></ResoPageTopbar>
				<MainWrapper className={"mt-none"}>
					<div className="overflow-x-scroll showscrollbar overflow-y-hidden">
						<TabsList className="w-full flex px-3 gap-2 h-12 min-w-min max-w-max">
							<TabsTrigger value="resolution">Edit</TabsTrigger>
							<TabsTrigger value="view">View</TabsTrigger>
							<TabsTrigger value="submitters">Submitters</TabsTrigger>
							{allowedToApprove && <TabsTrigger value="approve">Approve Resolution</TabsTrigger>}
							{isAllowedToSendBackToCommittee && <TabsTrigger value="send-back">Send Back to Committee</TabsTrigger>}
							{isMainSubmitter && selectedResolution?.status === "DRAFT" && <TabsTrigger value="submit">Submit Resolution</TabsTrigger>}
						</TabsList>
					</div>
					<TabsContent value="resolution">
						<div className=" mx-auto font-serif">
							<Suspense fallback="Loading...">
								<ResolutionEditor initialPreambutoryClauses={preambutoryClauses} initialOperativeClauses={operativeClauses} resolutionId={selectedResolution.id} title={selectedResolution.title} />
							</Suspense>
						</div>
					</TabsContent>
					<TabsContent value="submitters">
						<div className="flex flex-col gap-2 p-4 mb-6 bg-sidebar-accent rounded-lg">
							<Heading className="font-[Calsans] font-thin">Main Submitter</Heading>
							<Table>
								<TableHead>
									<TableRow>
										<TableHeader>Delegation Country</TableHeader>
										<TableHeader>Representing Student</TableHeader>
									</TableRow>
								</TableHead>
								<TableBody>
									{[selectedResolution.mainSubmitter].map((coSubmitter) => {
										const delegate = coSubmitter;
										const user = delegate.user;
										const allCountries = countries;
										const selectedCountry = allCountries?.find((country) => country?.countryCode === delegate?.country)?.countryNameEn;
										const fullName = user.displayName || `${user.officialName} ${user.officialSurname}`;
										const flagUrl = `https://flagcdn.com/h40/${delegate?.country?.toLocaleLowerCase()}.png`;
										return (
											<TableRow key={coSubmitter.id}>
												<TableCell>
													<div className="flex gap-4 align-middle">
														<Avatar size="sm" src={flagUrl} alt={selectedCountry + " flag"} />
														<p className="my-auto">{selectedCountry}</p>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex gap-4 align-middle">
														<Avatar showFallback size="sm" src={`/api/user/${user.id}/avatar`} alt={fullName + " avatar"} />
														<p className="my-auto">{fullName}</p>
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
						<div className="flex flex-col gap-2 p-4 bg-sidebar-accent rounded-lg">
							<div className="flex justify-between w-full">
								<Heading className="font-[Calsans] font-thin">Co-Submitters</Heading>
								{isMainSubmitter && selectedResolution.status === "DRAFT" && (
									<SearchParamsButton
										disabled={totalCosubmitters >= 15}
										searchParams={{
											"invite-co-submitter": selectedResolution.id,
										}}>
										Invite Co-Submitters
									</SearchParamsButton>
								)}
								{!isMainSubmitter && selectedResolution.status === "DRAFT" && (
									<SearchParamsButton
										searchParams={{
											"leave-co-submitter": selectedResolution.id,
										}}>
										Leave Resolution
									</SearchParamsButton>
								)}
							</div>
							{!!allCosubmitters.length ? (
								<Table>
									<TableHead>
										<TableRow>
											{isMainSubmitter && selectedResolution.status === "DRAFT" && (
												<TableHeader>
													<span className="sr-only">Actions</span>
												</TableHeader>
											)}
											<TableHeader>Delegation Country</TableHeader>
											<TableHeader>Representing Student</TableHeader>
											<TableHeader>Status</TableHeader>
										</TableRow>
									</TableHead>
									<TableBody>
										{allCosubmitters.map((coSubmitter) => {
											const delegate = coSubmitter.delegate;
											const user = delegate.user;
											const allCountries = countries;
											const selectedCountry = allCountries?.find((country) => country?.countryCode === delegate?.country)?.countryNameEn;
											const fullName = user.displayName || `${user.officialName} ${user.officialSurname}`;
											const flagUrl = `https://flagcdn.com/h40/${delegate?.country?.toLocaleLowerCase()}.png`;
											return (
												<TableRow key={coSubmitter.id}>
													{isMainSubmitter && selectedResolution.status === "DRAFT" && (
														<TableCell>
															<EditCoSubmitter coSubmitter={coSubmitter} selectedResolution={selectedResolution} />
														</TableCell>
													)}
													<TableCell>
														<div className="flex gap-4 align-middle">
															<Avatar size="sm" src={flagUrl} alt={selectedCountry + " flag"} />
															<p className="my-auto">{selectedCountry}</p>
														</div>
													</TableCell>
													<TableCell>
														<div className="flex gap-4 align-middle">
															<Avatar showFallback size="sm" src={`/api/user/${user.id}/avatar`} alt={fullName + " avatar"} />
															<p className="my-auto">{fullName}</p>
														</div>
													</TableCell>
													<TableCell>
														<Badge>{coSubmitter?.type === "CO_SUBMITTER" ? "Co-Submitter" : "Invited"}</Badge>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							) : (
								<Paginator itemsPerPage={10} totalItems={0} itemsOnPage={0} />
							)}
						</div>
					</TabsContent>
					<TabsContent value="submit">
						<div className="flex flex-col gap-2 p-4 mb-6 bg-sidebar-accent rounded-lg">
							<Heading className="font-[Calsans]">Submit Resolution to Chairs</Heading>
							<Subheading>
								Are you sure you want to submit this resolution? You and your co-submitters will no longer be able to edit this resolution.
								<br />
								<i>This can only be reverted by your chairs before the resolution is sent to the approval panel.</i>
							</Subheading>
							<SubmitResolutionToChairsButton resolutionId={selectedResolution.id} />
						</div>
					</TabsContent>
					<TabsContent value="approve">
						<div className="flex flex-col gap-2 p-4 mb-6 bg-sidebar-accent rounded-lg">
							<Heading className="font-[Calsans]">Approve & Submit Resolution</Heading>
							<Subheading>
								Are you sure you want to approve this resolution?
								<br />
								<i>The resolution will be sent back to the Approval Panel Manager for final approval</i>
							</Subheading>
							<SubmitApproveResolutionToManagerAP resolutionId={selectedResolution.id} />
						</div>
					</TabsContent>
					{isAllowedToSendBackToCommittee && (
						<TabsContent value="send-back">
							<div className="flex flex-col gap-2 p-4 mb-6 bg-sidebar-accent rounded-lg">
								<Heading className="font-[Calsans]">Send Back to Committee</Heading>
								<Subheading>
									Are you sure you want to send this resolution back to the committee? This action cannot be undone. You will still have access to the resolution but may not be able to edit it depending on your role.
								</Subheading>
								<SendBackToCommitteeButton resolutionId={selectedResolution.id} />
							</div>
						</TabsContent>
					)}
					<TabsContent value="view">
						<AutoRefresh />
						<ResolutionDisplay preambutoryClauses={selectedResolution.PreambulatoryClause} operativeClauses={selectedResolution.OperativeClause} />
					</TabsContent>
				</MainWrapper>
			</RefreshTabList>
		);
	}
}
