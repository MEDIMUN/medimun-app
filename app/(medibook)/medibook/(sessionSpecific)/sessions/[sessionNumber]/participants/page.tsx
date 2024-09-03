import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { generateUserData, userData, generateUserDataObject } from "@/lib/user";
import { authorize, s } from "@/lib/authorize";
import { Avatar } from "@nextui-org/avatar";
import Paginator from "@/components/pagination";
import { auth } from "@/auth";
import { SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { UserIdDisplay } from "@/lib/displayName";
import { DisplayCurrentRoles, DisplayPastRoles } from "@/lib/displayRoles";
import { ParticipantsDropdown } from "./components";
import { parseOrderDirection } from "@/lib/orderDirection";
import { romanize } from "@/lib/romanize";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";

export const metadata = {
	title: "Users",
	description: "See all users",
};

const itemsPerPage = 10;

const sortOptions = [
	{ value: "officialName", order: "asc", label: "Name", description: "Ascending" },
	{ value: "officialName", order: "desc", label: "Name", description: "Descending" },
	{ value: "officialSurname", order: "asc", label: "Surname", description: "Ascending" },
	{ value: "officialSurname", order: "desc", label: "Surname", description: "Descending" },
	{ value: "displayName", order: "asc", label: "Display Name", description: "Ascending" },
	{ value: "displayName", order: "desc", label: "Display Name", description: "Descending" },
	{ value: "id", order: "asc", label: "User ID", description: "Ascending" },
	{ value: "id", order: "desc", label: "User ID", description: "Descending" },
	{ value: "email", order: "asc", label: "Email", description: "Ascending" },
	{ value: "email", order: "desc", label: "Email", description: "Descending" },
	{ value: "username", order: "asc", label: "Username", description: "Ascending" },
	{ value: "username", order: "desc", label: "Username", description: "Descending" },
];

const rows = [
	<span className="sr-only">Actions</span>,
	<span className="sr-only">Profile Picture</span>,
	"Name",
	"Username",
	"Current Roles",
	"Other Roles",
];

export default async function Page({ params, searchParams }) {
	const authSession = await auth();
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";

	const orderBy = searchParams.order || "officialName";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const selectedSession = await prisma.session.findFirst({ where: { number: params.sessionNumber } }).catch(notFound);

	const isManagement = authorize(authSession, [s.management]);

	const queryObject = {
		AND: [
			{
				OR: [
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

	const prismaUsers = await prisma.user
		.findMany({
			where: { ...queryObject },
			include: { ...generateUserDataObject() },
			orderBy: { [orderBy]: orderDirection },
			skip: (currentPage - 1) * itemsPerPage,
			take: itemsPerPage,
		})
		.catch(notFound);

	const totalItems = await prisma.user.count({ where: { ...(queryObject as any) } }).catch(notFound);

	const usersWithData = prismaUsers.map((user) => {
		return { ...generateUserData(user), username: user.username };
	});

	return (
		<>
			<TopBar
				buttonText="Session"
				buttonHref={`/medibook/sessions/${selectedSession.number}`}
				sortOptions={sortOptions}
				title={`People of Session ${romanize(selectedSession.numberInteger)}`}
				defaultSort="officialNameasc"
				searchText="Search students..."
			/>
			{!!totalItems ? (
				<Table className="showscrollbar mt-10">
					<TableHead>
						<TableRow>
							{rows.map((row, i) => (
								<TableHeader key={i}>{row}</TableHeader>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{usersWithData.map((user) => {
							return (
								<TableRow key={user.id}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain aria-label="More options">
												<EllipsisVerticalIcon />
											</DropdownButton>
											<DropdownMenu anchor="bottom end">
												<DropdownItem href={`/medibook/users/${user.username || user.id}`}>View Profile</DropdownItem>
												{isManagement && (
													<>
														<SearchParamsDropDropdownItem searchParams={{ "edit-user": user.id }}>Edit</SearchParamsDropDropdownItem>
														<SearchParamsDropDropdownItem searchParams={{ "assign-roles": user.id }}>Assign</SearchParamsDropDropdownItem>
														<SearchParamsDropDropdownItem searchParams={{ "edit-roles": user.id }}>Edit</SearchParamsDropDropdownItem>
														<SearchParamsDropDropdownItem searchParams={{ "delete-user": user.id }}>Delete</SearchParamsDropDropdownItem>
													</>
												)}
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>
										<Avatar
											showFallback
											radius="none"
											className="mask mask-squircle bg-gradient-to-tr from-primary to-red-500 text-white"
											src={`/api/users/${user.id}/avatar`}
											alt={user.displayName}
										/>
									</TableCell>
									<TableCell>{user.displayName || `${user.officialName} ${user.officialSurname}`}</TableCell>
									<TableCell>{user.username || "-"}</TableCell>
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
			) : (
				<div className="my-10 text-center">
					<h3 className="mt-2 text-sm font-semibold text-gray-900">No Users Found</h3>
				</div>
			)}
			<Paginator itemsPerPage={itemsPerPage} totalItems={totalItems} />
		</>
	);
}
