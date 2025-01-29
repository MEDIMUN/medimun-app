import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { SearchParamsDropDropdownItem, TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";

import Paginator from "@/components/pagination";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import { Avatar } from "@heroui/avatar";
import { parseOrderDirection } from "@/lib/order-direction";
import { UserIdDisplay } from "@/lib/display-name";
import { DisplayCurrentRoles, DisplayPastRoles } from "@/lib/display-roles";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Ellipsis } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";

const itemsPerPage = 10;

const rows = [
	<span key="actions" className="sr-only">
		Actions
	</span>,
	<span key="avatar" className="sr-only">
		Profile Picture
	</span>,
	"Name",
	"Surname",
	"Display Name",
	"User ID",
	"Email",
	"Username",
	"Current Roles",
	"Other Roles",
];

const sortOptions = [
	{ value: "officialName", order: "asc", label: "Name" },
	{ value: "officialName", order: "desc", label: "Name" },
	{ value: "officialSurname", order: "asc", label: "Surname" },
	{ value: "officialSurname", order: "desc", label: "Surname" },
	{ value: "displayName", order: "asc", label: "Display Name" },
	{ value: "displayName", order: "desc", label: "Display Name" },
	{ value: "id", order: "asc", label: "User ID" },
	{ value: "id", order: "desc", label: "User ID" },
	{ value: "email", order: "asc", label: "Email" },
	{ value: "email", order: "desc", label: "Email" },
	{ value: "username", order: "asc", label: "Username" },
	{ value: "username", order: "desc", label: "Username" },
];

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const currentPage = parseInt(searchParams.page) || 1;
	const query = searchParams.search || "";
	const authSession = await auth();
	const orderBy = searchParams.order || "officialName";
	if (!authorize(authSession, [s.schooldirector])) notFound();

	const selectedSchool = await prisma.school
		.findFirstOrThrow({ where: { OR: [{ id: params.schoolId }, { slug: params.schoolId }] } })
		.catch(notFound);

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

	const [selectedSchoolStudents, totalItems] = await prisma
		.$transaction([
			prisma.user.findMany({
				orderBy: { [orderBy]: orderDirection },
				take: itemsPerPage,
				skip: (currentPage - 1) * itemsPerPage,
				where: { ...(queryObject as any) },
				include: { ...generateUserDataObject() },
			}),
			prisma.user.count({ where: { ...(queryObject as any) } }),
		])
		.catch(notFound);

	const usersWithData = selectedSchoolStudents.map((user) => {
		return {
			...generateUserData(user),
			email: user.email,
			username: user.username,
		};
	});
	return (
		<>
			<TopBar
				buttonHref={`/medibook/schools/${selectedSchool.slug || selectedSchool.id}`}
				buttonText={selectedSchool.name}
				sortOptions={sortOptions}
				title="School Students"
				subheading={`${totalItems || "No"} Students`}
				defaultSort="officialNameasc"
				searchText="Search students..."
			/>
			<MainWrapper>
				{!!totalItems && (
					<Table className="showscrollbar">
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
											<Dropdown>
												<DropdownButton plain aria-label="More options">
													<Ellipsis width={18} />
												</DropdownButton>
												<DropdownMenu>
													<SearchParamsDropDropdownItem searchParams={{ "edit-user": student.id }}>Edit User</SearchParamsDropDropdownItem>
													<SearchParamsDropDropdownItem searchParams={{ "unafilliate-student": student.id }}>
														Unafilliate Student
													</SearchParamsDropDropdownItem>
													<DropdownItem href={`/medibook/users/${student.username || student.id}`}>View Profile</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</TableCell>
										<TableCell>
											<UserTooltip userId={student.id} key={student.id}>
												<Avatar size="md" radius="md" showFallback src={`/api/users/${student.id}/avatar`} alt={student.displayName} />
											</UserTooltip>
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
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
				<Paginator itemsPerPage={itemsPerPage} totalItems={totalItems} itemsOnPage={usersWithData.length} />
			</MainWrapper>
		</>
	);
}
