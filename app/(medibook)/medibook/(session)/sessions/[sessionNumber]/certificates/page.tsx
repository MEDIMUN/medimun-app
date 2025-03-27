import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import { authorize, authorizeChairDelegate, authorizeDirectPerSession, authorizeManagerMember, authorizeSchoolDirectorStudent, s } from "@/lib/authorize";
import { Avatar } from "@heroui/avatar";
import Paginator from "@/components/pagination";
import { auth } from "@/auth";
import { SearchParamsDropDropdownItem, TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { DisplayRolesInSelectedSession } from "@/lib/display-roles";
import { parseOrderDirection } from "@/lib/order-direction";
import { romanize } from "@/lib/romanize";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Link } from "@/components/link";
import { Download, Ellipsis, Eye, Info } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";
import { cn } from "@/lib/utils";
import { UserSelector } from "@/app/(medibook)/medibook/(global)/users/components/UserSelector";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateTabs } from "./components/tabs";
import { SelectedUsersWindow } from "@/app/(medibook)/medibook/(global)/users/components/SelectedUsersWindow";
import { CreateParticipationCertificatesButton } from "./components/create-participation-certificates-button";
import { FastLink } from "@/components/fast-link";
import { Button } from "@/components/button";
import { DownloadButton, DownloadDropdownItem } from "@/components/ui/download-button";
import { Badge } from "@/components/badge";
import { SelectEligibleWindow } from "./components/select-eligible";

export async function generateMetadata({ params }) {
	const { sessionNumber } = await params;
	const romanized = romanize(parseInt(sessionNumber));
	return {
		title: `Session ${romanized} Certificates`,
		description: `View all fellow delegates, student officers and directors in the session.`,
	};
}

const TABS = {
	delegates: true,
	chairs: true,
	members: true,
	managers: true,
	schoolDirectors: true,
	secretariat: true,
	directors: true,
	created: true,
} as const;

const itemsPerPage = 50;

const sortOptions = [
	{ value: "officialName", order: "asc", label: "Name", isVisible: true },
	{ value: "officialName", order: "desc", label: "Name", isVisible: true },
	{ value: "officialSurname", order: "asc", label: "Surname", isVisible: true },
	{ value: "officialSurname", order: "desc", label: "Surname", isVisible: true },
	{ value: "displayName", order: "asc", label: "Display Name", isVisible: true },
	{ value: "displayName", order: "desc", label: "Display Name", isVisible: true },
	{ value: "id", order: "asc", label: "User ID", isVisible: true },
	{ value: "id", order: "desc", label: "User ID", isVisible: true },
	{ value: "email", order: "asc", label: "Email" },
	{ value: "email", order: "desc", label: "Email" },
	{ value: "username", order: "asc", label: "Username", isVisible: true },
	{ value: "username", order: "desc", label: "Username", isVisible: true },
	{ label: "School", value: "Student", order: `{"name":"asc"}`, isVisible: true },
	{ label: "School", value: "Student", order: `{"name":"desc"}`, isVisible: true },
];

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const authSession = await auth();
	if (!authSession) notFound();
	const isManagement = authorize(authSession, [s.management]);
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "officialName";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const selectedSession = await prisma.session
		.findFirstOrThrow({ where: { number: params.sessionNumber }, include: { Day: { orderBy: { date: "asc" }, include: { RollCall: { orderBy: { index: "asc" } } } } } })
		.catch(notFound);

	const searchObject = {
		OR: [
			{ officialName: { contains: query, mode: "insensitive" } },
			{ username: { contains: query, mode: "insensitive" } },
			{ id: { contains: query, mode: "insensitive" } },
			{ officialSurname: { contains: query, mode: "insensitive" } },
			{ displayName: { contains: query, mode: "insensitive" } },
			{ email: { contains: query, mode: "insensitive" } },
			{ Student: { name: { contains: query, mode: "insensitive" } } },
		],
	};

	const queryObjects = {
		delegates: {
			CertificateAwardedTo: { none: { session: { number: params.sessionNumber } } },
			AND: [{ OR: [{ delegate: { some: { committee: { session: { number: params.sessionNumber } } } } }] }, searchObject],
		},
		chairs: {
			CertificateAwardedTo: { none: { session: { number: params.sessionNumber } } },
			AND: [{ OR: [{ chair: { some: { committee: { session: { number: params.sessionNumber } } } } }] }, searchObject],
		},
		members: {
			CertificateAwardedTo: { none: { session: { number: params.sessionNumber } } },
			AND: [{ OR: [{ member: { some: { department: { session: { number: params.sessionNumber } } } } }] }, searchObject],
		},
		managers: {
			CertificateAwardedTo: { none: { session: { number: params.sessionNumber } } },
			AND: [{ OR: [{ manager: { some: { department: { session: { number: params.sessionNumber } } } } }] }, searchObject],
		},
		schoolDirectors: {
			CertificateAwardedTo: { none: { session: { number: params.sessionNumber } } },
			AND: [{ OR: [{ schoolDirector: { some: { session: { number: params.sessionNumber } } } }] }, searchObject],
		},
		secretariat: {
			CertificateAwardedTo: { none: { session: { number: params.sessionNumber } } },
			AND: [
				{
					OR: [
						{ secretaryGeneral: { some: { session: { number: params.sessionNumber } } } },
						{ deputySecretaryGeneral: { some: { session: { number: params.sessionNumber } } } },
						{ presidentOfTheGeneralAssembly: { some: { session: { number: params.sessionNumber } } } },
						{ deputyPresidentOfTheGeneralAssembly: { some: { session: { number: params.sessionNumber } } } },
					],
				},
				searchObject,
			],
		},
		directors: {
			CertificateAwardedTo: { none: { session: { number: params.sessionNumber } } },
			AND: [{ OR: [{ Director: { some: {} } }, { seniorDirector: { some: {} } }] }, searchObject],
		},
		created: {
			CertificateAwardedTo: { some: { session: { number: params.sessionNumber } } },
			AND: [
				{
					OR: [
						{ Director: { some: {} } },
						{ seniorDirector: { some: {} } },
						{ delegate: { some: { committee: { session: { number: params.sessionNumber } } } } },
						{ chair: { some: { committee: { session: { number: params.sessionNumber } } } } },
						{ member: { some: { department: { session: { number: params.sessionNumber } } } } },
						{ manager: { some: { department: { session: { number: params.sessionNumber } } } } },
						{ schoolDirector: { some: { session: { number: params.sessionNumber } } } },
						{ secretaryGeneral: { some: { session: { number: params.sessionNumber } } } },
						{ deputySecretaryGeneral: { some: { session: { number: params.sessionNumber } } } },
						{ presidentOfTheGeneralAssembly: { some: { session: { number: params.sessionNumber } } } },
						{ deputyPresidentOfTheGeneralAssembly: { some: { session: { number: params.sessionNumber } } } },
					],
				},
				searchObject,
			],
		},
	};

	type TabType = keyof typeof TABS;

	// Check if the tab is valid at runtime
	if (!(searchParams.tab in TABS) && searchParams.tab) {
		return notFound();
	}

	const [users, totalItems] = await prisma
		.$transaction([
			prisma.user.findMany({
				where: { ...(queryObjects[searchParams.tab] as any) },
				include: {
					...generateUserDataObject(),
					MorningPresent: { where: { day: { session: { number: params.sessionNumber } } } },
					CommitteeRollCall: { where: { rollCall: { day: { session: { number: params.sessionNumber } } } } },
					CertificateAwardedTo: {
						where: { session: { number: params.sessionNumber } },
						include: { studentSignature: { select: { officialName: true, officialSurname: true, id: true } }, teacherSignature: { select: { officialName: true, officialSurname: true, id: true } } },
					},
				},
				orderBy: { [orderBy]: orderDirection },
				skip: (currentPage - 1) * itemsPerPage,
				take: itemsPerPage,
			}),
			prisma.user.count({ where: { CertificateAwardedTo: { none: { session: { number: params.sessionNumber } } }, ...(queryObjects[searchParams.tab] as any) } }),
		])
		.catch();

	const usersWithData = users.map((user) => {
		return {
			...generateUserData(user),
			username: user.username,
			hasProfilePicture: !!user.profilePicture,
			isProfilePrivate: user.isProfilePrivate,
			schoolSlug: user?.Student?.slug,
			email: user.email,
			CertificateAwardedTo: user.CertificateAwardedTo,
			MorningPresent: user.MorningPresent,
			CommitteeRollCall: user.CommitteeRollCall,
		};
	});

	const selectAllMap = usersWithData.map((user) => {
		return {
			id: user.id,
			officialName: user.officialName,
		};
	});

	const eligibleDelegatesorMembers = usersWithData
		.filter((user) => {
			return user.MorningPresent.length === selectedSession.Day.length;
		})
		.map((user) => {
			return {
				id: user.id,
				officialName: user.officialName,
			};
		});

	return (
		<>
			<TopBar
				buttonText={`Session ${romanize(selectedSession.numberInteger)}`}
				buttonHref={`/medibook/sessions/${selectedSession.number}`}
				sortOptions={sortOptions}
				title={`Certificates`}
				defaultSort="officialNameasc"
				searchText="Search students..."
			/>
			<MainWrapper>
				{searchParams.tab !== "created" && <SelectedUsersWindow selectAll={selectAllMap} customEmptyText="Select users to generate certificates" />}
				{!selectedSession.publishCertificates && (
					<div className="rounded-md bg-neutral-100 p-4">
						<div className="flex">
							<div className="shrink-0">
								<Info aria-hidden="true" className="size-5 text-neutral-400" />
							</div>
							<div className="ml-3 flex-1 md:flex md:justify-between">
								<p className="text-sm text-neutral-700">Certificates not published yet. Publish them in session settings.</p>
								<p className="mt-3 text-sm md:ml-6 md:mt-0">
									<FastLink href="./settings#certificates" className="whitespace-nowrap font-medium text-neutral-700 hover:text-neutral-600">
										Session Settings
										<span aria-hidden="true"> &rarr;</span>
									</FastLink>
								</p>
							</div>
						</div>
					</div>
				)}
				<div className="div bg-neutral-100 empty:hidden rounded-lg p-4 flex gap-4">
					<CreateParticipationCertificatesButton />
					<SelectEligibleWindow eligibleDelegatesorMembers={eligibleDelegatesorMembers} />
				</div>
				<CertificateTabs>
					<div className="overflow-x-scroll showscrollbar overflow-y-hidden">
						<TabsList className="w-full flex px-3 gap-2 h-12 min-w-min max-w-max">
							<TabsTrigger value="delegates">Delegates</TabsTrigger>
							<TabsTrigger value="chairs">Chairs</TabsTrigger>
							<TabsTrigger value="members">Members</TabsTrigger>
							<TabsTrigger value="managers">Managers</TabsTrigger>
							<TabsTrigger value="schoolDirectors">School Directors</TabsTrigger>
							<TabsTrigger value="secretariat">Secretariat</TabsTrigger>
							<TabsTrigger value="directors">Directors</TabsTrigger>
							<TabsTrigger value="created">Created Certificates</TabsTrigger>
						</TabsList>
					</div>
					{!!totalItems && (
						<Table className="showscrollbar">
							<TableHead>
								<TableRow>
									{searchParams.tab !== "created" && (
										<TableHeader>
											<span className="sr-only">Select</span>
										</TableHeader>
									)}
									<TableHeader>
										<span className="sr-only">Actions</span>
									</TableHeader>
									<TableHeader>
										<span className="sr-only">Profile Picture</span>
									</TableHeader>
									<TableHeader>Official Name</TableHeader>
									<TableHeader>Official Surname</TableHeader>
									<TableHeader>Roles</TableHeader>
									{searchParams.tab === "created" && (
										<>
											<TableHeader>Certificate ID</TableHeader>
											<TableHeader>Certificate Status</TableHeader>
											<TableHeader>Name Override</TableHeader>
											<TableHeader>Special Message</TableHeader>
											<TableHeader>Student Signature</TableHeader>
											<TableHeader>Teacher Signature</TableHeader>
										</>
									)}
									{["delegates", "members"].includes(searchParams.tab) && <TableHeader>Morning Registration</TableHeader>}
									{["delegates"].includes(searchParams.tab) && <TableHeader>Committee Roll Call</TableHeader>}
									<TableHeader>School</TableHeader>
								</TableRow>
							</TableHead>
							<TableBody>
								{usersWithData.map((user) => {
									const isChairOfUser = authorizeChairDelegate(authSession?.user.currentRoles, [...user.currentRoles, ...user.pastRoles]);
									const isManagerOfUser = authorizeManagerMember(authSession?.user.currentRoles, [...user.currentRoles, ...user.pastRoles]);
									const isDirectorOfStudent = authorizeSchoolDirectorStudent(authSession?.user.currentRoles, [...user.currentRoles, ...user.pastRoles]);
									const isAbove = authSession.user.highestRoleRank < user?.highestRoleRank;

									const isAuthorizedToEdit = isAbove && (isChairOfUser || isManagerOfUser || isDirectorOfStudent || isManagement);
									const isHigherAndManagement = isAbove && isManagement;

									return (
										<TableRow key={user.id}>
											{searchParams.tab !== "created" && (
												<TableCell>
													<UserSelector uid={user.id} officialName={user.officialName} maxNo={50} />
												</TableCell>
											)}
											<TableCell>
												<Dropdown>
													<DropdownButton plain aria-label="More options">
														<Ellipsis width={18} />
													</DropdownButton>
													<DropdownMenu anchor="bottom end">
														<DropdownItem href={`/medibook/users/${user.username || user.id}`}>View Profile</DropdownItem>
														{isAuthorizedToEdit && <SearchParamsDropDropdownItem searchParams={{ "edit-user": user.id }}>Edit User</SearchParamsDropDropdownItem>}
														{isHigherAndManagement && (
															<>
																<SearchParamsDropDropdownItem searchParams={{ "assign-roles": user.id }}>Assign Roles</SearchParamsDropDropdownItem>
																<SearchParamsDropDropdownItem searchParams={{ "edit-roles": user.id }}>Edit Roles</SearchParamsDropDropdownItem>
															</>
														)}
														{searchParams.tab === "created" && (
															<>
																<DropdownItem href={`./certificates/${user.CertificateAwardedTo[0].id}`}>View certificate</DropdownItem>
																<SearchParamsDropDropdownItem searchParams={{ "edit-participation-certificate": user.CertificateAwardedTo[0].id }}>Edit certificate</SearchParamsDropDropdownItem>
																<SearchParamsDropDropdownItem searchParams={{ "delete-participation-certificate": user.CertificateAwardedTo[0].id }}>Delete certificate</SearchParamsDropDropdownItem>
																<DownloadDropdownItem
																	href={`/api/certificates/${user.CertificateAwardedTo[0].id}?download=true`}
																	filename={`${user.officialName} ${user.officialSurname} | MEDIMUN ${romanize(selectedSession.numberInteger)} (${user.CertificateAwardedTo[0].id})`}>
																	Download certificate
																</DownloadDropdownItem>
															</>
														)}
													</DropdownMenu>
												</Dropdown>
											</TableCell>
											<TableCell>
												<UserTooltip userId={user.id}>
													<Avatar size="sm" showFallback radius="md" src={user.hasProfilePicture ? `/api/users/${user.id}/avatar` : ""} alt={user.displayName} />
												</UserTooltip>
											</TableCell>
											<TableCell>{user.officialName}</TableCell>
											<TableCell>{user.officialSurname}</TableCell>
											<TableCell>
												<DisplayRolesInSelectedSession user={user} sessionNumber={selectedSession.number} />
											</TableCell>
											{searchParams.tab === "created" && (
												<>
													<TableCell>{user.CertificateAwardedTo[0].id}</TableCell>
													<TableCell>{user.CertificateAwardedTo[0].isVoid ? <Badge color="red">Void</Badge> : <Badge color="green">Valid</Badge>}</TableCell>
													<TableCell>{user.CertificateAwardedTo[0].nameOverride || "-"}</TableCell>
													<TableCell>{user.CertificateAwardedTo[0].specialMessage || "-"}</TableCell>
													<TableCell>
														{user.CertificateAwardedTo[0].studentSignature?.id ? (
															<UserTooltip userId={user.CertificateAwardedTo[0].studentSignature?.id}>
																<div className="flex items-center gap-3">
																	<Avatar isBordered size="sm" className="w-6 h-6" showFallback src={`/api/users/${user.CertificateAwardedTo[0].studentSignature?.id}/avatar`} />
																	{user.CertificateAwardedTo[0].studentSignature?.officialName} {user.CertificateAwardedTo[0].studentSignature?.officialSurname}
																</div>
															</UserTooltip>
														) : (
															"-"
														)}
													</TableCell>
													<TableCell>
														{user.CertificateAwardedTo[0].teacherSignature?.id ? (
															<UserTooltip userId={user.CertificateAwardedTo[0].teacherSignature?.id}>
																<div className="flex items-center gap-3">
																	<Avatar isBordered size="sm" className="w-6 h-6" showFallback src={`/api/users/${user.CertificateAwardedTo[0].teacherSignature?.id}/avatar`} />
																	{user.CertificateAwardedTo[0].teacherSignature?.officialName} {user.CertificateAwardedTo[0].teacherSignature?.officialSurname}
																</div>
															</UserTooltip>
														) : (
															"-"
														)}
													</TableCell>
												</>
											)}
											{["delegates", "members"].includes(searchParams.tab) && (
												<TableCell>
													<div className="flex space-x-1">
														{authorizeDirectPerSession({ user }, [s.delegate, s.member], [params.sessionNumber])
															? selectedSession.Day.map((day) => {
																	return (
																		<div
																			className={cn("rounded-full w-3 h-3 aspect-square", user.MorningPresent.find((present) => present.dayId === day.id) ? "bg-green-500" : "bg-red-500")}
																			key={day.id + " " + user.id}></div>
																	);
																})
															: "N/A"}
													</div>
												</TableCell>
											)}
											{["delegates"].includes(searchParams.tab) && (
												<TableCell>
													<div className="flex space-x-1">
														{authorizeDirectPerSession({ user }, [s.delegate], [params.sessionNumber])
															? selectedSession.Day.map((day) => {
																	return (
																		<div
																			className={cn(
																				"gap-1 min-w-5 flex p-1",
																				user.MorningPresent.find((present) => present.dayId === day.id) ? "bg-green-200" : "bg-red-200",
																				day.type === "WORKSHOP" ? "rounded-sm" : "rounded-full"
																			)}
																			key={day.id}>
																			{day.RollCall.map((rollCall, i) => {
																				return (
																					<div
																						title={rollCall.name || `Roll Call ${i + 1}`}
																						className={cn(
																							"rounded-full w-3 h-3 aspect-square",
																							user.CommitteeRollCall.find((present) => present.rollCallId === rollCall.id) ? "bg-green-500" : "bg-red-500",
																							day.type === "WORKSHOP" ? "rounded-sm" : "rounded-full"
																						)}
																						key={rollCall.id}></div>
																				);
																			})}
																		</div>
																	);
																})
															: "N/A"}
													</div>
												</TableCell>
											)}
											<TableCell>
												<Link className="underline text-primary" href={`/medibook/schools/${user.schoolSlug || user.schoolId}`}>
													{user.schoolName}
												</Link>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
					<Paginator itemsOnPage={users.length} itemsPerPage={itemsPerPage} totalItems={totalItems} />
				</CertificateTabs>
			</MainWrapper>
		</>
	);
}
