import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { countries } from "@/data/countries";
import { OptionsDropdown } from "./buttons";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";

import Paginator from "@/components/Paginator";
import { Link } from "@/components/link";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import { Avatar } from "@nextui-org/avatar";
import { parseOrderDirection } from "@/lib/orderDirection";
import { UserIdDisplay } from "@/lib/displayName";
import { DisplayCurrentRoles, DisplayPastRoles } from "@/lib/displayRoles";

const itemsPerPage = 10;

const rows = [
	<span className="sr-only">Profile Picture</span>,
	"Name",
	"Surname",
	"Display Name",
	"User ID",
	"Email",
	"Username",
	"Current Roles",
	"Other Roles",
	<span className="sr-only">Actions</span>,
];

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

export default async function Page({ params, searchParams }) {
	const currentPage = parseInt(searchParams.page) || 1;
	const query = searchParams.search || "";
	const authSession = await auth();
	if (!authorize(authSession, [s.schooldirector])) notFound();
	const orderBy = searchParams.order || "officialName";
	const selectedSchool = await prisma.school.findFirst({ where: { OR: [{ id: params.schoolId }, { slug: params.schoolId }] } });
	const queryObject = {
		AND: [
			{ Student: { id: selectedSchool.id } },
			{
				OR: [
					{ officialName: { contains: query, mode: "insensitive" } },
					{ officialSurname: { contains: query, mode: "insensitive" } },
					{ displayName: { contains: query, mode: "insensitive" } },
					{ username: { contains: query, mode: "insensitive" } },
					{ id: query },
					{ email: { contains: query, mode: "insensitive" } },
				],
			},
		],
	};
	const orderDirection = parseOrderDirection(searchParams.direction);

	const selectedSchoolStudents = await prisma.user.findMany({
		orderBy: { [orderBy]: orderDirection },
		take: itemsPerPage,
		skip: (currentPage - 1) * itemsPerPage,
		where: { ...queryObject },
		include: { ...generateUserDataObject() },
	});

	const numberOfStudents = await prisma.user.count({ where: { ...queryObject } });

	const usersWithData = selectedSchoolStudents.map((user) => {
		return {
			...generateUserData(user),
			email: user.email,
			username: user.username,
		};
	});
	return (
		<>
			<TopBar sortOptions={sortOptions} title={`${selectedSchool.name} Students`} defaultSort="officialNameasc" searchText="Search students..." />
			{!!numberOfStudents ? (
				<Table className="showscrollbar mt-10">
					<TableHead>
						<TableRow>
							{rows.map((row, i) => (
								<TableHeader key={i}>{row}</TableHeader>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{usersWithData.map((student) => {
							return (
								<TableRow key={student.id}>
									<TableCell>
										<Avatar
											showFallback
											radius="none"
											className="mask mask-squircle"
											src={`/api/users/${student.id}/avatar`}
											alt={student.displayName}
										/>
									</TableCell>
									<TableCell>{student.officialName}</TableCell>
									<TableCell>{student.officialSurname}</TableCell>
									<TableCell>{student.displayName || "-"}</TableCell>
									<TableCell className="font-mono">
										<UserIdDisplay userId={student.id} />
									</TableCell>
									<TableCell>{student.email || "-"}</TableCell>
									<TableCell>{student.username || "-"}</TableCell>
									<TableCell>
										<DisplayCurrentRoles user={student} />
									</TableCell>
									<TableCell>
										<DisplayPastRoles user={student} />
									</TableCell>
									<TableCell>
										<OptionsDropdown userId={student.id} username={student.username} />
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			) : (
				<div className="my-10 text-center">
					<h3 className="mt-2 text-sm font-semibold text-gray-900">No Students Found</h3>
				</div>
			)}
			<Paginator itemsPerPage={itemsPerPage} totalItems={numberOfStudents} />
		</>
	);
}
