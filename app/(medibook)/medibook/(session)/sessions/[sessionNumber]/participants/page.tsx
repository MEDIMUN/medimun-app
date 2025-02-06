import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import { authorize, authorizeChairDelegate, authorizeManagerMember, authorizeSchoolDirectorStudent, s } from "@/lib/authorize";
import { Avatar } from "@heroui/avatar";
import Paginator from "@/components/pagination";
import { auth } from "@/auth";
import { SearchParamsDropDropdownItem, TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { DisplayCurrentRoles, DisplayPastRoles } from "@/lib/display-roles";
import { parseOrderDirection } from "@/lib/order-direction";
import { romanize } from "@/lib/romanize";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Link } from "@/components/link";
import { Ellipsis } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";

export async function generateMetadata({ params }) {
	const { sessionNumber } = await params;
	const romanized = romanize(parseInt(sessionNumber));
	return {
		title: `Session ${romanized} Participants`,
		description: `View all fellow delegates, student officers and directors in the session.`,
	};
}

const itemsPerPage = 10;

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
	const selectedSession = await prisma.session.findFirstOrThrow({ where: { number: params.sessionNumber } }).catch(notFound);

	const queryObject = {
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
			{
				OR: [
					{ officialName: { contains: query, mode: "insensitive" } },
					{ username: { contains: query, mode: "insensitive" } },
					{ id: { contains: query, mode: "insensitive" } },
					{ officialSurname: { contains: query, mode: "insensitive" } },
					{ displayName: { contains: query, mode: "insensitive" } },
					{ email: { contains: query, mode: "insensitive" } },
				],
			},
		],
	};

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

	const [users, totalItems] = await prisma
		.$transaction([
			prisma.user.findMany({
				where: { ...(queryObject as any) },
				include: { ...generateUserDataObject() },
				orderBy: { [orderBy]: orderDirection },
				skip: (currentPage - 1) * itemsPerPage,
				take: itemsPerPage,
			}),
			prisma.user.count({ where: { ...(queryObject as any) } }),
		])
		.catch();

	const usersWithData = users.map((user) => {
		return {
			...generateUserData(user),
			username: user.username,
			isProfilePrivate: user.isProfilePrivate,
			schoolSlug: user?.Student?.slug,
			email: user.email,
		};
	});

	const isMaangementChairMemberSchoolDirector = isManagement || authorize(authSession, [s.schooldirector, s.chair, s.manager]);

	return (
		<>
			<TopBar
				buttonText={`Session ${romanize(selectedSession.numberInteger)}`}
				buttonHref={`/medibook/sessions/${selectedSession.number}`}
				sortOptions={sortOptions}
				title={`Participants`}
				defaultSort="officialNameasc"
				searchText="Search students..."
			/>
			<MainWrapper>
				{!!totalItems && (
					<Table className="showscrollbar">
						<TableHead>
							<TableRow>
								<TableHeader>
									<span key="actions" className="sr-only">
										Actions
									</span>
								</TableHeader>
								<TableHeader>
									<span key="avatar" className="sr-only">
										Profile Picture
									</span>
								</TableHeader>
								{isMaangementChairMemberSchoolDirector ? (
									<>
										<TableHeader>Full Name</TableHeader>
										<TableHeader>Name</TableHeader>
										<TableHeader>Surname</TableHeader>
										<TableHeader>Display Name</TableHeader>
									</>
								) : (
									<TableHeader>Full Name</TableHeader>
								)}
								{isMaangementChairMemberSchoolDirector && <TableHeader>Email</TableHeader>}
								<TableHeader>School</TableHeader>
								<TableHeader>Username</TableHeader>
								<TableHeader>Current Roles</TableHeader>
								<TableHeader>Other Roles</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{usersWithData.map((user) => {
								let publicUsername = user.displayName;

								if (user.displayName && user.displayName.includes(" ")) {
									const split = publicUsername.split(" ");
									publicUsername = `${split[0]} ${split[1][0]}.`;
								}

								const fullName = user.displayName || `${user.officialName} ${user.officialSurname}`;
								const preferredPublicName = user.isProfilePrivate ? publicUsername || `${user.officialName} ${user.officialSurname[0]}.` : fullName;

								const isChairOfUser = authorizeChairDelegate(authSession?.user.currentRoles, [...user.currentRoles, ...user.pastRoles]);
								const isManagerOfUser = authorizeManagerMember(authSession?.user.currentRoles, [...user.currentRoles, ...user.pastRoles]);
								const isDirectorOfStudent = authorizeSchoolDirectorStudent(authSession?.user.currentRoles, [...user.currentRoles, ...user.pastRoles]);
								const isAbove = authSession.user.highestRoleRank < user.highestRoleRank;

								const isAuthorizedToEdit = isAbove && (isChairOfUser || isManagerOfUser || isDirectorOfStudent || isManagement);
								const isIsIsIs = isChairOfUser || isManagerOfUser || isDirectorOfStudent || isManagement;
								const isHigherAndManagement = isAbove && isManagement;

								return (
									<TableRow key={user.id}>
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
															<SearchParamsDropDropdownItem searchParams={{ "delete-user": user.id }}>Delete User</SearchParamsDropDropdownItem>
														</>
													)}
												</DropdownMenu>
											</Dropdown>
										</TableCell>
										<TableCell>
											<UserTooltip userId={user.id}>
												<Avatar showFallback radius="md" src={`/api/users/${user.id}/avatar`} alt={user.displayName} />
											</UserTooltip>
										</TableCell>
										{isMaangementChairMemberSchoolDirector ? (
											isIsIsIs ? (
												<>
													<TableCell>{"-"}</TableCell>
													<TableCell>{user.officialName}</TableCell>
													<TableCell>{user.officialSurname}</TableCell>
													<TableCell>{user.displayName || "-"}</TableCell>
												</>
											) : (
												<>
													<TableCell>{preferredPublicName}</TableCell>
													<TableCell>{"-"}</TableCell>
													<TableCell>{"-"}</TableCell>
													<TableCell>{"-"}</TableCell>
												</>
											)
										) : (
											<TableCell>{preferredPublicName}</TableCell>
										)}

										{isMaangementChairMemberSchoolDirector ? isIsIsIs ? <TableCell>{user.email}</TableCell> : <TableCell>-</TableCell> : null}
										<TableCell>
											{user.schoolId ? (
												<Link className="underline text-primary" href={`/medibook/schools/${user.schoolSlug || user.schoolId}`}>
													{user.schoolName}
												</Link>
											) : (
												"-"
											)}
										</TableCell>
										<TableCell>{user.username ? `@${user.username}` : "-"}</TableCell>
										<TableCell>
											<DisplayCurrentRoles user={user} />
										</TableCell>
										<TableCell>
											<DisplayPastRoles user={user} />
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
				<Paginator itemsOnPage={users.length} itemsPerPage={itemsPerPage} totalItems={totalItems} />
			</MainWrapper>
		</>
	);
}
