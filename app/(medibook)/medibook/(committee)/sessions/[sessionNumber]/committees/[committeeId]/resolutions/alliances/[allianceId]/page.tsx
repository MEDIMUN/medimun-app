import { auth } from "@/auth";
import { TopBar } from "@/components/top-bar";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainWrapper } from "@/components/main-wrapper";
import { countries } from "@/data/countries";
import { Heading } from "@/components/heading";
import { Avatar } from "@heroui/avatar";
import { SearchParamsButton } from "@/app/(medibook)/medibook/client-components";
import { Badge } from "@/components/badge";
import Paginator from "@/components/pagination";
import { EditCoSubmitter } from "@/global-pages/resolutionViewer/_components/edit-co-submitter";
import { EditAllianceMember } from "./_components/edit-co-submitter";
import { ClauseEditor } from "@/components/clause-editor";
import { OperativePhrases, PreambulatoryPhrases } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ScClauseEditor } from "./_components/clause-editor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";

export default function Page(props) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SCAlliancePage {...props} />
		</Suspense>
	);
}

export async function SCAlliancePage(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;
	const authSession = await auth();
	if (!authSession) return notFound();

	const selectedAlliance = await prisma.alliance.findUnique({
		where: {
			id: params.allianceId,
			OR: [{ AllianceMember: { some: { delegate: { userId: authSession.user.id } } } }, { mainSubmitter: { userId: authSession.user.id } }],
			committee: {
				session: { number: params.sessionNumber },
				OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
			},
		},
		include: {
			topic: true,
			mainSubmitter: { include: { user: true } },
			committee: { include: { Topic: true, ExtraCountry: true } },
			AllianceMember: { include: { delegate: { include: { user: true } } } },
			AllianceMemberInvitation: { include: { delegate: { include: { user: true } } } },
			OperativeClause: { include: { mainSubmitter: { include: { user: true } } } },
			PreambulatoryClause: { include: { mainSubmitter: { include: { user: true } } } },
		},
	});

	if (!selectedAlliance) return notFound();

	const isMainSubmitter = selectedAlliance.mainSubmitter.userId === authSession.user.id;
	const totalMembers = selectedAlliance.AllianceMember.length;
	const allMembers = selectedAlliance.AllianceMember.concat(selectedAlliance.AllianceMemberInvitation);

	return (
		<>
			<TopBar
				buttonHref={`/medibook/committees/${selectedAlliance?.committee.id}/resolutions`}
				buttonText={"Resolutions"}
				hideSearchBar
				title={`Alliance A${selectedAlliance?.number.toString().padStart(5, "0")}`}
				subheading={selectedAlliance?.topic.title}
			/>
			<MainWrapper>
				<Tabs defaultValue="PREAMBULATORY_CLAUSES">
					<div className="overflow-x-scroll showscrollbar overflow-y-hidden">
						<TabsList className="w-full flex px-3 gap-2 h-12 min-w-min max-w-max">
							<TabsTrigger value="PREAMBULATORY_CLAUSES">Preambulatory Clauses</TabsTrigger>
							<TabsTrigger value="OPERATIVE_CLAUSES">Operative Clauses</TabsTrigger>
							<TabsTrigger value="ALLIANCE_MEMBERS">Alliance Members</TabsTrigger>
						</TabsList>
					</div>
					<TabsContent value="PREAMBULATORY_CLAUSES">
						<SearchParamsButton searchParams={{ "create-preambulatory-clause": selectedAlliance.id }}>Add Preambulatory Clause</SearchParamsButton>
						<Table className="mt-4">
							<TableHead>
								<TableRow>
									<TableHeader>Clause</TableHeader>
									<TableHeader>Main Submitter</TableHeader>
								</TableRow>
							</TableHead>
							<TableBody>
								{selectedAlliance.PreambulatoryClause.map((clause) => {
									const user = clause.mainSubmitter?.user;
									const fullName = user?.displayName || `${user?.officialName} ${user?.officialSurname}`;
									const flagUrl = `https://flagcdn.com/h40/${clause?.country?.toLocaleLowerCase()}.png`;
									const allCountries = countries.concat(selectedAlliance.committee.ExtraCountry);
									const selectedCountry = allCountries?.find((country) => country?.countryCode === clause.mainSubmitter?.country)?.countryNameEn;
									return (
										<TableRow key={clause.id}>
											<TableCell>{clause.body}</TableCell>
											<TableCell>
												<div className="flex gap-4 align-middle">
													<Avatar size="sm" src={flagUrl} alt={selectedCountry + " flag"} />
													<p className="my-auto">{selectedCountry}</p>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TabsContent>
					<TabsContent value="OPERATIVE_CLAUSES">
						<SearchParamsButton searchParams={{ "create-operative-clause": selectedAlliance.id }}>Add Operative Clause</SearchParamsButton>
					</TabsContent>
					<TabsContent value="ALLIANCE_MEMBERS">
						<div className="flex flex-col gap-2 p-4 mb-6 bg-sidebar-accent rounded-lg">
							<Heading className="font-[Calsans] font-thin"> Alliance Owner</Heading>
							<Table>
								<TableHead>
									<TableRow>
										<TableHeader>Delegation Country</TableHeader>
										<TableHeader>Representing Student</TableHeader>
									</TableRow>
								</TableHead>
								<TableBody>
									{[selectedAlliance.mainSubmitter].map((coSubmitter) => {
										const delegate = coSubmitter;
										const user = delegate.user;
										const allCountries = countries;
										const selectedCountry = allCountries?.find((country) => country?.countryCode === delegate?.country)?.countryNameEn;
										const fullName = user.displayName || `${user.officialName} ${user.officialSurname}`;
										const flagUrl = `https://flagcdn.com/h40/${coSubmitter?.country?.toLocaleLowerCase()}.png`;
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
								<Heading className="font-[Calsans] font-thin">Alliance Member</Heading>
								{isMainSubmitter && (
									<SearchParamsButton disabled={totalMembers >= 15} searchParams={{ "invite-alliance-member": selectedAlliance.id }}>
										Invite Member
									</SearchParamsButton>
								)}
								{!isMainSubmitter && <SearchParamsButton searchParams={{ "leave-alliance": selectedAlliance.id }}>Leave Alliance</SearchParamsButton>}
							</div>
							{!!allMembers.length ? (
								<Table>
									<TableHead>
										<TableRow>
											{isMainSubmitter && (
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
										{allMembers.map((coSubmitter) => {
											const delegate = coSubmitter.delegate;
											const user = delegate.user;
											const allCountries = countries;
											const selectedCountry = allCountries?.find((country) => country?.countryCode === delegate?.country)?.countryNameEn;
											const fullName = user.displayName || `${user.officialName} ${user.officialSurname}`;
											const flagUrl = `https://flagcdn.com/h40/${delegate?.country?.toLocaleLowerCase()}.png`;
											return (
												<TableRow key={coSubmitter.id}>
													{isMainSubmitter && (
														<TableCell>
															<EditAllianceMember allianceMember={coSubmitter} selectedAlliance={selectedAlliance} />
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
				</Tabs>
			</MainWrapper>
		</>
	);
}
