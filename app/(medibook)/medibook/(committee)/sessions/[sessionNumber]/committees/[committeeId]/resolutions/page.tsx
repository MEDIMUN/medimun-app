import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { MainWrapper } from "@/components/main-wrapper";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Ellipsis } from "lucide-react";
import Paginator from "@/components/pagination";
import { Avatar } from "@heroui/avatar";
import { countries } from "@/data/countries";
import { ReplyButtons } from "./_components/reply-buttons";
import { CommitteeType, Resolution } from "@prisma/client";
import { getResolutionName } from "@/lib/get-resolution-name";
import BlackLogo from "@/public/assets/branding/logos/logo-black.svg";
import Image from "next/image";
import { ReplyAllianceButtons } from "./_components/reply-alliance-buttons";

export default function Page(props) {
	return (
		<Suspense
			fallback={
				<main className="overflow-x-hidden h-screen bg-primary flex items-center justify-center align-middle w-full overflow-y-scroll">
					<div className="m-auto">
						<Image className="w-64" src={BlackLogo} alt="Loading..." />
					</div>
				</main>
			}>
			<CommitteeResolutions {...props} />
		</Suspense>
	);
}

async function CommitteeResolutions(props) {
	await connection();
	const params = await props.params;
	const searchParams = await props.searchParams;
	const authSession = await auth();
	if (!authSession) return null;
	const currentPage = searchParams["page"] || 1;
	const perPage = 10;

	const isManagement = authorize(authSession, [s.management]);
	const selectedSession = await prisma.session
		.findFirstOrThrow({
			where: {
				number: params.sessionNumber,
				...(isManagement ? {} : { isPartlyVisible: true }),
			},
			include: {
				committee: {
					where: { OR: [{ id: params.committeeId }, { slug: params.committeeId }] },
					take: 1,
					include: {
						ExtraCountry: true,
					},
				},
			},
		})
		.catch(notFound);

	const type: CommitteeType = selectedSession.committee[0].type;

	const isChairOfCommittee = authorizeChairCommittee([...(authSession?.user?.currentRoles || []), ...(authSession?.user?.pastRoles || [])], selectedSession.committee[0].id);

	const isDelegateOfCommittee = authorizeDelegateCommittee([...(authSession?.user?.currentRoles || []), ...(authSession?.user?.pastRoles || [])], selectedSession.committee[0].id);

	const isPartOfCommittee = isChairOfCommittee || isDelegateOfCommittee || authorize(authSession, [s.manager, s.member]);

	if (!isPartOfCommittee && !isManagement) notFound();

	if (selectedSession.committee[0].type === "GENERALASSEMBLY")
		return (
			<GaReslutionPage
				{...props}
				{...{
					params,
					searchParams,
					authSession,
					selectedSession,
					currentPage,
					perPage,
					isManagement,
					isChairOfCommittee,
					isDelegateOfCommittee,
					isPartOfCommittee,
				}}
			/>
		);

	if (selectedSession.committee[0].type === "SECURITYCOUNCIL")
		return (
			<ScResolutionPage
				{...props}
				{...{
					params,
					searchParams,
					authSession,
					selectedSession,
					currentPage,
					perPage,
					isManagement,
					isChairOfCommittee,
					isDelegateOfCommittee,
					isPartOfCommittee,
				}}
			/>
		);
}

async function ScResolutionPage({ params, searchParams, authSession, selectedSession, currentPage, perPage, isManagement, isChairOfCommittee, isDelegateOfCommittee, isPartOfCommittee }) {
	const [MY_ALLIANCES, MY_ALLIANCES_LENGTH] = await prisma.$transaction([
		prisma.alliance.findMany({
			where: {
				committeeId: selectedSession.committee[0].id,
				mainSubmitter: { userId: authSession.user.id },
			},
			include: {
				topic: true,
				committee: {
					select: {
						ExtraCountry: true,
					},
				},
				AllianceMember: {
					select: {
						delegate: {
							select: {
								userId: true,
								country: true,
								user: {
									select: {
										displayName: true,
										officialName: true,
										officialSurname: true,
									},
								},
							},
						},
					},
				},
				mainSubmitter: {
					select: {
						userId: true,
						country: true,
						user: {
							select: {
								displayName: true,
								officialName: true,
								officialSurname: true,
							},
						},
					},
				},
			},
			skip: (currentPage - 1) * perPage,
			take: perPage,
		}),
		prisma.resolution.count({
			where: {
				committeeId: selectedSession.committee[0].id,
				mainSubmitter: { userId: authSession.user.id },
			},
		}),
	]);

	const [ALLIANCE_INVITATIONS, ALLIANCE_INVITATIONS_LENGTH] = await prisma.$transaction([
		prisma.allianceMemberInvitation.findMany({
			where: {
				delegate: {
					userId: authSession.user.id,
				},
			},
			include: {
				alliance: {
					include: {
						topic: true,
						mainSubmitter: {
							select: {
								userId: true,
								country: true,
								user: {
									select: {
										displayName: true,
										officialName: true,
										officialSurname: true,
									},
								},
							},
						},
					},
				},
			},
		}),
		prisma.allianceMemberInvitation.count({
			where: {
				delegate: {
					userId: authSession.user.id,
				},
			},
		}),
	]);

	//joined-alliances
	const [JOINED_ALLIANCES, JOINED_ALLIANCES_LENGTH] = await prisma.$transaction([
		prisma.alliance.findMany({
			where: {
				AllianceMember: {
					some: {
						delegate: {
							userId: authSession.user.id,
						},
					},
				},
			},
			include: {
				topic: true,
				committee: {
					select: {
						ExtraCountry: true,
					},
				},
				AllianceMember: {
					select: {
						delegate: {
							select: {
								userId: true,
								country: true,
								user: {
									select: {
										displayName: true,
										officialName: true,
										officialSurname: true,
									},
								},
							},
						},
					},
				},
				mainSubmitter: {
					select: {
						userId: true,
						country: true,
						user: {
							select: {
								displayName: true,
								officialName: true,
								officialSurname: true,
							},
						},
					},
				},
			},
			skip: (currentPage - 1) * perPage,
			take: perPage,
		}),
		prisma.alliance.count({
			where: {
				AllianceMember: {
					some: {
						delegate: {
							userId: authSession.user.id,
						},
					},
				},
			},
		}),
	]);

	const allCountries = countries.concat(selectedSession.committee[0].ExtraCountry);

	return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}`}
				buttonText={selectedSession.committee[0].name}
				hideSearchBar
				title="Committee Resolutions">
				<SearchParamsButton searchParams={{ "create-alliance": selectedSession.committee[0].id }}>Create Alliance</SearchParamsButton>
			</TopBar>
			<MainWrapper>
				<Tabs defaultValue={isChairOfCommittee ? "ALL_ALLIANCES" : "MY_ALLIANCES"} className="w-full">
					<div className="overflow-x-scroll showscrollbar overflow-y-hidden">
						<TabsList className="w-full flex px-3 gap-2 h-12 min-w-min max-w-max">
							<TabsTrigger value="MY_ALLIANCES">My Alliances</TabsTrigger>
							<TabsTrigger value="JOINED_ALLIANCES">Joined Alliances</TabsTrigger>
							{isDelegateOfCommittee && <TabsTrigger value="ALLIANCE_INVITATIONS">Alliance Invitations</TabsTrigger>}
							{(isChairOfCommittee || isManagement) && <TabsTrigger value="ALL_ALLIANCES">All Alliances</TabsTrigger>}
							<TabsTrigger value="PREAMBS">All Preambulatory Clauses</TabsTrigger>
							<TabsTrigger value="OPERATIVES">All Operative Clauses</TabsTrigger>
							<TabsTrigger value="DRAFT">Draft Resolutions</TabsTrigger>
							<TabsTrigger className="!text-red-500" value="FAILED">
								Failed Resolutions
							</TabsTrigger>
							<TabsTrigger className="!text-green-500" value="PASSED">
								Adopted Resolutions
							</TabsTrigger>
						</TabsList>
					</div>
					<TabsContent value="MY_ALLIANCES">
						{!!MY_ALLIANCES.length && (
							<Table>
								<TableHead>
									<TableRow>
										<TableHeader>
											<span className="sr-only">Actions</span>
										</TableHeader>
										<TableHeader>Name</TableHeader>
										<TableHeader>Creator</TableHeader>
										<TableHeader>Topic</TableHeader>
										<TableHeader>Members</TableHeader>
									</TableRow>
								</TableHead>
								<TableBody>
									{MY_ALLIANCES.map((alliance) => {
										const myCountry = allCountries.find((country) => country.countryCode === alliance.mainSubmitter.country);
										const members = alliance.AllianceMember.map((member) => {
											const country = allCountries.find((country) => country.countryCode === member.delegate.country);
											return country?.countryNameEn;
										});
										return (
											<TableRow key={alliance.id}>
												<TableCell>
													<Dropdown>
														<DropdownButton plain>
															<Ellipsis />
														</DropdownButton>
														<DropdownMenu>
															<DropdownItem href={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}/resolutions/alliances/${alliance.id}`}>
																View
															</DropdownItem>
															<SearchParamsDropDropdownItem searchParams={{ "invite-alliance-member": alliance.id }}>Invite Member</SearchParamsDropDropdownItem>
															<SearchParamsDropDropdownItem searchParams={{ "delete-alliance": alliance.id }}>Delete</SearchParamsDropDropdownItem>
														</DropdownMenu>
													</Dropdown>
												</TableCell>
												<TableCell>A{alliance.number.toString().padStart(5, "0")}</TableCell>
												<TableCell>{myCountry?.countryNameEn}</TableCell>
												<TableCell>{alliance?.topic.title}</TableCell>
												<TableCell>{members.join(", ") || "No Members Assigned"}</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
						<Paginator itemsPerPage={perPage} totalItems={MY_ALLIANCES_LENGTH} itemsOnPage={MY_ALLIANCES.length} />
					</TabsContent>
					<TabsContent value="ALLIANCE_INVITATIONS">
						{!!ALLIANCE_INVITATIONS.length && (
							<ul className="mt-6">
								{ALLIANCE_INVITATIONS.map((invitation) => {
									const allCountries = countries;
									const selectedCountry = allCountries?.find((country) => country?.countryCode === invitation?.alliance.mainSubmitter.country)?.countryNameEn;
									const fullName = invitation.alliance.mainSubmitter?.user?.displayName || `${invitation.alliance.mainSubmitter?.user?.officialName} ${invitation.alliance.mainSubmitter?.user?.officialSurname}`;
									return (
										<div key={invitation.id} className="flex gap-4 flex-col md:flex-row justify-between items-center p-4 border-y border-gray-200">
											<div>
												<p className="font-semibold">Alliance A{invitation.alliance.number.toString().padStart(5, "0")}</p>
												<p className="text-sm">{invitation.alliance.topic.title}</p>
												<p className="text-sm">
													Invited by: {selectedCountry} ({fullName})
												</p>
											</div>
											<ReplyAllianceButtons allianceId={invitation.allianceId} />
										</div>
									);
								})}
							</ul>
						)}
						<Paginator itemsPerPage={perPage} totalItems={ALLIANCE_INVITATIONS_LENGTH} itemsOnPage={ALLIANCE_INVITATIONS.length} />
					</TabsContent>
					<TabsContent value="JOINED_ALLIANCES">
						{!!JOINED_ALLIANCES.length && (
							<Table>
								<TableHead>
									<TableRow>
										<TableHeader>
											<span className="sr-only">Actions</span>
										</TableHeader>
										<TableHeader>Name</TableHeader>
										<TableHeader>Creator</TableHeader>
										<TableHeader>Topic</TableHeader>
										<TableHeader>Members</TableHeader>
									</TableRow>
								</TableHead>
								<TableBody>
									{JOINED_ALLIANCES.map((alliance) => {
										const myCountry = allCountries.find((country) => country.countryCode === alliance.mainSubmitter.country);
										const members = alliance.AllianceMember.map((member) => {
											const country = allCountries.find((country) => country.countryCode === member.delegate.country);
											return country?.countryNameEn;
										});
										return (
											<TableRow key={alliance.id}>
												<TableCell>
													<Dropdown>
														<DropdownButton plain>
															<Ellipsis />
														</DropdownButton>
														<DropdownMenu>
															<DropdownItem href={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}/resolutions/alliances/${alliance.id}`}>
																View
															</DropdownItem>
															<SearchParamsDropDropdownItem searchParams={{ "leave-alliance": alliance.id }}>Leave</SearchParamsDropDropdownItem>
														</DropdownMenu>
													</Dropdown>
												</TableCell>
												<TableCell>A{alliance.number.toString().padStart(5, "0")}</TableCell>
												<TableCell>{myCountry?.countryNameEn}</TableCell>
												<TableCell>{alliance?.topic.title}</TableCell>
												<TableCell>{members.join(", ") || "No Members Assigned"}</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
						<Paginator itemsPerPage={perPage} totalItems={JOINED_ALLIANCES_LENGTH} itemsOnPage={JOINED_ALLIANCES.length} />
					</TabsContent>
				</Tabs>
			</MainWrapper>
		</>
	);
}

async function GaReslutionPage({ params, searchParams, authSession, selectedSession, currentPage, perPage, isManagement, isChairOfCommittee, isDelegateOfCommittee, isPartOfCommittee }) {
	const whereObject = {
		committeeId: selectedSession.committee[0].id,
		mainSubmitter: { userId: authSession.user.id },
	};

	const [myResolutions, numberOfMyResolutions, coSubmitterInvitations, coSubmittingResolutions, coSubmittingResolutionsLength] = await prisma.$transaction([
		prisma.resolution.findMany({
			where: whereObject,
			include: {
				topic: true,
				mainSubmitter: true,
			},
			skip: (currentPage - 1) * perPage,
			take: perPage,
		}),
		prisma.resolution.count({
			where: whereObject,
		}),
		prisma.coSubmitterInvitation.findMany({
			where: {
				resolution: {
					committeeId: selectedSession.committee[0].id,
				},
				delegate: {
					userId: authSession.user.id,
				},
			},
			include: {
				resolution: {
					include: {
						topic: true,
						mainSubmitter: {
							select: {
								userId: true,
								country: true,
								user: {
									select: {
										displayName: true,
										officialName: true,
										officialSurname: true,
									},
								},
							},
						},
					},
				},
				delegate: { include: { user: true } },
			},
		}),
		prisma.resolution.findMany({
			where: { CoSubmitters: { some: { delegate: { userId: authSession.user.id } } } },
			include: { topic: true, mainSubmitter: true },
		}),
		prisma.resolution.count({ where: { CoSubmitters: { some: { delegate: { userId: authSession.user.id } } } } }),
	]);

	let DRAFT = [],
		DRAFTLENGTH = 0,
		SENT_TO_CHAIRS = [],
		SENT_TO_CHAIRSLENGTH = 0,
		SENT_TO_APPROVAL_PANEL = [],
		SENT_TO_APPROVAL_PANELLENGTH = 0,
		SENT_BACK_TO_COMMITTEE = [],
		SENT_BACK_TO_COMMITTEELENGTH = 0;

	if (isChairOfCommittee) {
		[DRAFT, DRAFTLENGTH, SENT_TO_CHAIRS, SENT_TO_CHAIRSLENGTH, SENT_TO_APPROVAL_PANEL, SENT_TO_APPROVAL_PANELLENGTH, SENT_BACK_TO_COMMITTEE, SENT_BACK_TO_COMMITTEELENGTH] = await prisma.$transaction([
			prisma.resolution.findMany({
				where: {
					committeeId: selectedSession.committee[0].id,
					status: "DRAFT",
				},
				include: {
					topic: true,
					mainSubmitter: true,
				},
				skip: (currentPage - 1) * perPage,
				take: perPage,
			}),
			prisma.resolution.count({
				where: {
					committeeId: selectedSession.committee[0].id,
					status: "DRAFT",
				},
			}),
			prisma.resolution.findMany({
				where: {
					committeeId: selectedSession.committee[0].id,
					status: "SENT_TO_CHAIRS",
				},
				include: {
					topic: true,
					mainSubmitter: true,
				},
				skip: (currentPage - 1) * perPage,
				take: perPage,
			}),
			prisma.resolution.count({
				where: {
					committeeId: selectedSession.committee[0].id,
					status: "SENT_TO_CHAIRS",
				},
			}),
			prisma.resolution.findMany({
				where: {
					committeeId: selectedSession.committee[0].id,
					status: { in: ["SENT_TO_APPROVAL_PANEL", "ASSIGNED_TO_EDITOR"] },
				},
				include: {
					topic: true,
					mainSubmitter: true,
				},
				skip: (currentPage - 1) * perPage,
				take: perPage,
			}),
			prisma.resolution.count({
				where: {
					committeeId: selectedSession.committee[0].id,
					status: { in: ["SENT_TO_APPROVAL_PANEL", "ASSIGNED_TO_EDITOR"] },
				},
			}),
			prisma.resolution.findMany({
				where: {
					committeeId: selectedSession.committee[0].id,
					status: { in: ["SENT_BACK_TO_COMMITTEE", "IN_DEBATE", "VOTING"] },
				},
				include: {
					topic: true,
					mainSubmitter: true,
					committee: true,
				},
				skip: (currentPage - 1) * perPage,
				take: perPage,
			}),
			prisma.resolution.count({
				where: {
					committeeId: selectedSession.committee[0].id,
					status: { in: ["SENT_BACK_TO_COMMITTEE", "IN_DEBATE", "VOTING"] },
				},
			}),
		]);
	}

	[SENT_BACK_TO_COMMITTEE, SENT_BACK_TO_COMMITTEELENGTH] = await prisma.$transaction([
		prisma.resolution.findMany({
			where: {
				committeeId: selectedSession.committee[0].id,
				status: { in: ["SENT_BACK_TO_COMMITTEE", "IN_DEBATE", "VOTING"] },
			},
			include: {
				topic: true,
				mainSubmitter: true,
				committee: true,
			},
			skip: (currentPage - 1) * perPage,
			take: perPage,
		}),
		prisma.resolution.count({
			where: {
				committeeId: selectedSession.committee[0].id,
				status: { in: ["SENT_BACK_TO_COMMITTEE", "IN_DEBATE", "VOTING"] },
			},
		}),
	]);

	return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}`}
				buttonText={selectedSession.committee[0].name}
				hideSearchBar
				title="Committee Resolutions">
				<SearchParamsButton searchParams={{ "add-committee-resolution": true }}>Add Resolution</SearchParamsButton>
			</TopBar>
			<MainWrapper>
				<Tabs defaultValue={isChairOfCommittee ? "DRAFT" : "main_resolutions"} className="w-full">
					<div className="overflow-x-scroll showscrollbar overflow-y-hidden">
						<TabsList className="w-full flex px-3 gap-2 h-12 min-w-min max-w-max">
							{isDelegateOfCommittee && <TabsTrigger value="main_resolutions">Main Submitting Resolutions</TabsTrigger>}
							{isDelegateOfCommittee && <TabsTrigger value="co_resolutions">Co-Submitting Resolutions</TabsTrigger>}
							{isChairOfCommittee && (
								<TabsTrigger value="DRAFT">
									Draft <Badge className="ml-1 !rounded-full"> Stage 1 </Badge>
								</TabsTrigger>
							)}
							{isDelegateOfCommittee && <TabsTrigger value="invitations">Co-Submitter Invitations</TabsTrigger>}
							{(isChairOfCommittee || isManagement) && (
								<TabsTrigger value="SENT_TO_CHAIRS">
									Submitted to Chairs <Badge className="ml-1 !rounded-full"> Stage 2 </Badge>
								</TabsTrigger>
							)}
							{(isChairOfCommittee || isManagement) && (
								<TabsTrigger value="SENT_TO_APPROVAL_PANEL">
									Sent to Approval Panel
									<Badge className="ml-1 !rounded-full"> Stage 3 </Badge>
								</TabsTrigger>
							)}
							{(isChairOfCommittee || isManagement || isDelegateOfCommittee) && <TabsTrigger value="SENT_BACK_TO_COMMITTEE">To Be Debated</TabsTrigger>}
							<TabsTrigger className="!text-red-500" value="FAILED">
								Failed Resolutions
							</TabsTrigger>
							<TabsTrigger className="!text-green-500" value="PASSED">
								Adopted Resolutions
							</TabsTrigger>
						</TabsList>
					</div>
					<TabsContent value="main_resolutions">
						{!!myResolutions.length && (
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
									{myResolutions.map((resolution) => (
										<TableRow key={resolution.id}>
											<TableCell>
												<Dropdown>
													<DropdownButton plain>
														<Ellipsis />
													</DropdownButton>
													<DropdownMenu>
														<DropdownItem href={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}/resolutions/${resolution.id}`}>
															View
														</DropdownItem>
														{((resolution.status === "DRAFT" && resolution.mainSubmitter.userId === authSession.user.id) || isManagement) && (
															<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>Delete</SearchParamsDropDropdownItem>
														)}
													</DropdownMenu>
												</Dropdown>
											</TableCell>
											<TableCell>{resolution.title}</TableCell>
											<TableCell>
												<Badge>{resolution.status.replaceAll("_", " ")}</Badge>
											</TableCell>
											<TableCell>{resolution.topic.title}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
						<Paginator itemsPerPage={perPage} totalItems={numberOfMyResolutions} itemsOnPage={myResolutions.length} />
					</TabsContent>
					<TabsContent value="co_resolutions">
						{!!coSubmittingResolutions.length && (
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
									{coSubmittingResolutions.map((resolution) => (
										<TableRow key={resolution.id}>
											<TableCell>
												<Dropdown>
													<DropdownButton plain>
														<Ellipsis />
													</DropdownButton>
													<DropdownMenu>
														<DropdownItem href={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}/resolutions/${resolution.id}`}>
															View
														</DropdownItem>
														{((resolution.status === "DRAFT" && resolution.mainSubmitter.userId === authSession.user.id) || isManagement) && (
															<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>Delete</SearchParamsDropDropdownItem>
														)}
													</DropdownMenu>
												</Dropdown>
											</TableCell>
											<TableCell>{resolution.title}</TableCell>
											<TableCell>
												<Badge>{resolution.status.replaceAll("_", " ")}</Badge>
											</TableCell>
											<TableCell>{resolution.topic.title}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
						<Paginator itemsPerPage={perPage} totalItems={coSubmittingResolutionsLength} itemsOnPage={coSubmittingResolutions.length} />
					</TabsContent>
					<TabsContent value="invitations">
						<ul className="mt-6">
							{coSubmitterInvitations.map((invitation) => {
								const allCountries = countries;
								const selectedCountry = allCountries?.find((country) => country?.countryCode === invitation?.resolution.mainSubmitter.country)?.countryNameEn;
								const fullName = invitation.resolution.mainSubmitter?.user?.displayName || `${invitation.resolution.mainSubmitter?.user?.officialName} ${invitation.resolution.mainSubmitter?.user?.officialSurname}`;
								return (
									<div key={invitation.id} className="flex gap-4 flex-col md:flex-row justify-between items-center p-4 border-y border-gray-200">
										<div>
											<p className="font-semibold">{invitation.resolution.title}</p>
											<p className="text-sm">{invitation.resolution.topic.title}</p>
											<p className="text-sm">
												Invited by: {selectedCountry} ({fullName})
											</p>
										</div>
										<ReplyButtons resolutionId={invitation.resolutionId} />
									</div>
								);
							})}
						</ul>
					</TabsContent>
					<TabsContent value="DRAFT">
						{!!DRAFT.length && (
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
									{DRAFT.map((resolution) => (
										<TableRow key={resolution.id}>
											<TableCell>
												<Dropdown>
													<DropdownButton plain>
														<Ellipsis />
													</DropdownButton>
													<DropdownMenu>
														<DropdownItem href={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}/resolutions/${resolution.id}`}>
															View
														</DropdownItem>
														{((resolution.status === "DRAFT" && resolution.mainSubmitter.userId === authSession.user.id) || isManagement) && (
															<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>Delete</SearchParamsDropDropdownItem>
														)}
													</DropdownMenu>
												</Dropdown>
											</TableCell>
											<TableCell>{resolution.title}</TableCell>
											<TableCell>
												<Badge>{resolution.status.replaceAll("_", " ")}</Badge>
											</TableCell>
											<TableCell>{resolution.topic.title}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
						<Paginator itemsPerPage={perPage} totalItems={DRAFTLENGTH} itemsOnPage={DRAFT.length} />
					</TabsContent>
					<TabsContent value="SENT_TO_CHAIRS">
						{!!SENT_TO_CHAIRS.length && (
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
									{SENT_TO_CHAIRS.map((resolution: Resolution) => (
										<TableRow key={resolution.id}>
											<TableCell>
												<Dropdown>
													<DropdownButton plain>
														<Ellipsis />
													</DropdownButton>
													<DropdownMenu>
														<DropdownItem href={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}/resolutions/${resolution.id}`}>
															View
														</DropdownItem>
														{((resolution.status === "DRAFT" && resolution.mainSubmitter.userId === authSession.user.id) ||
															isManagement ||
															(isChairOfCommittee && ["DRAFT", "SENT_BACK_TO_COMMITTEE", "SENT_TO_CHAIRS", "IN_DEBATE", "VOTING"].includes(resolution.status))) && (
															<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>Delete</SearchParamsDropDropdownItem>
														)}
														{(isChairOfCommittee || isManagement) && resolution.status === "SENT_TO_CHAIRS" && (
															<SearchParamsDropDropdownItem searchParams={{ "send-resolution-to-approval": resolution.id }}>Send for Approval</SearchParamsDropDropdownItem>
														)}
													</DropdownMenu>
												</Dropdown>
											</TableCell>
											<TableCell>{resolution.title}</TableCell>
											<TableCell>
												<Badge>{resolution.status.replaceAll("_", " ")}</Badge>
											</TableCell>
											<TableCell>{resolution.topic.title}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
						<Paginator itemsPerPage={perPage} totalItems={SENT_TO_CHAIRSLENGTH} itemsOnPage={SENT_TO_CHAIRS.length} />
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
														<DropdownItem href={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}/resolutions/${resolution.id}`}>
															View
														</DropdownItem>
														{((resolution.status === "DRAFT" && resolution.mainSubmitter.userId === authSession.user.id) ||
															isManagement ||
															(isChairOfCommittee && ["DRAFT", "SENT_BACK_TO_COMMITTEE", "SENT_TO_CHAIRS", "IN_DEBATE", "VOTING"].includes(resolution.status))) && (
															<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>Delete</SearchParamsDropDropdownItem>
														)}
														{(isChairOfCommittee || isManagement) && resolution.status === "SENT_TO_APPROVAL_PANEL" && (
															<SearchParamsDropDropdownItem searchParams={{ "send-resolution-to-approval": resolution.id }}>Send for Approval</SearchParamsDropDropdownItem>
														)}
													</DropdownMenu>
												</Dropdown>
											</TableCell>
											<TableCell>{resolution.title}</TableCell>
											<TableCell>
												<Badge>{resolution.status.replaceAll("_", " ")}</Badge>
											</TableCell>
											<TableCell>{resolution.topic.title}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
						<Paginator itemsPerPage={perPage} totalItems={SENT_TO_APPROVAL_PANELLENGTH} itemsOnPage={SENT_TO_APPROVAL_PANEL.length} />
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
														<DropdownItem href={`/medibook/sessions/${selectedSession.number}/committees/${selectedSession.committee[0].slug || selectedSession.committee[0].id}/resolutions/${resolution.id}`}>
															View
														</DropdownItem>
														{((resolution.status === "DRAFT" && resolution.mainSubmitter.userId === authSession.user.id) ||
															isManagement ||
															(isChairOfCommittee && ["DRAFT", "SENT_BACK_TO_COMMITTEE", "SENT_TO_CHAIRS", "IN_DEBATE", "VOTING"].includes(resolution.status))) && (
															<SearchParamsDropDropdownItem searchParams={{ "delete-committee-resolution": resolution.id }}>Delete</SearchParamsDropDropdownItem>
														)}
														{(isChairOfCommittee || isManagement) && resolution.status === "SENT_BACK_TO_COMMITTEE" && (
															<SearchParamsDropDropdownItem searchParams={{ "send-resolution-to-approval": resolution.id }}>Send for Approval</SearchParamsDropDropdownItem>
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
						<Paginator itemsPerPage={perPage} totalItems={SENT_BACK_TO_COMMITTEELENGTH} itemsOnPage={SENT_BACK_TO_COMMITTEE.length} />
					</TabsContent>
				</Tabs>
			</MainWrapper>
		</>
	);
}
