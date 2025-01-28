import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import { auth } from "@/auth";
import { UserSelector } from "./components/UserSelector";
import Paginator from "@/components/pagination";
import { usersPerPage } from "@/data/constants";
import { Tooltip } from "@heroui/tooltip";
import { Image } from "@heroui/image";
import { SelectedContextProvider } from "./components/StateStateProvider";
import { SelectedUsersWindow } from "./components/SelectedUsersWindow";
import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@/components/badge";
import { parseOrderDirection } from "@/lib/order-direction";
import { UserIdDisplay } from "@/lib/display-name";
import { DisplayCurrentRoles, DisplayPastRoles } from "@/lib/display-roles";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Ellipsis } from "lucide-react";

/* export const dynamic = "force-dynamic";
export const revalidate = 0; */

const userTypeColorMap = {
	Active: "green",
	Disabled: "red",
	Standalone: "yellow",
};

const sortOptions = [
	{ label: "Name", value: "officialName", order: "asc" },
	{ label: "Name", value: "officialName", order: "desc" },
	{ label: "Surname", value: "officialSurname", order: "asc" },
	{ label: "Surname", value: "officialSurname", order: "desc" },
	{ label: "Display Name", value: "displayName", order: "asc" },
	{ label: "Display Name", value: "displayName", order: "desc" },
	{ label: "Username", value: "username", order: "asc" },
	{ label: "Username", value: "username", order: "desc" },
	{ label: "Email", value: "email", order: "asc" },
	{ label: "Email", value: "email", order: "desc" },
	{ label: "ID", value: "id", order: "asc" },
	{ label: "ID", value: "id", order: "desc" },
	{ label: "School", value: "Student", order: `{"name":"asc"}` },
	{ label: "School", value: "Student", order: `{"name":"desc"}` },
];

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const maxNoOfSelected = 25;
	const authSession = await auth();
	if (!authSession) return notFound();
	const highestRoleRank = authSession.user.highestRoleRank;
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "officialName";
	const orderDirection = parseOrderDirection(searchParams.direction);

	const queryObject = {
		where: {
			OR: [
				{ officialName: { contains: query, mode: "insensitive" } },
				{ username: { contains: query, mode: "insensitive" } },
				{ id: { contains: query, mode: "insensitive" } },
				{ officialSurname: { contains: query, mode: "insensitive" } },
				{ displayName: { contains: query, mode: "insensitive" } },
				{ email: { contains: query, mode: "insensitive" } },
				{ Student: { name: { contains: query, mode: "insensitive" } } },
			],
		},
	};

	const userDataQueryObject = generateUserDataObject();

	let [users, numberOfUsers] = await prisma
		.$transaction([
			prisma.user.findMany({
				include: { ...userDataQueryObject, Account: { select: { id: true } } },
				...(queryObject as any),
				skip: (currentPage - 1) * usersPerPage,
				take: usersPerPage,
				orderBy: { [orderBy]: orderDirection },
			}),
			prisma.user.count({ ...(queryObject as any) }),
		])
		.catch(notFound);

	const processedUsers = users.map((user) => {
		return {
			...generateUserData(user),
			isDisabled: user.isDisabled,
			username: user.username,
			type: user.isDisabled ? "Disabled" : user?.Account?.length ? "Active" : "Standalone",
			hasPfp: !!user.profilePicture,
			email: user.email,
		};
	});

	let editUsers: any[] = [];
	if (searchParams.select) {
		const selectedUserIds = searchParams.select.split("U").filter((id) => id);
		if (selectedUserIds.length === 0) return;
		editUsers = await prisma.user
			.findMany({
				where: { id: { in: selectedUserIds } },
				include: { ...userDataQueryObject },
			})
			.catch(notFound);
		editUsers = editUsers.map((user) => ({ ...user, highestRoleRank: generateUserData(user).highestRoleRank }));
		editUsers = editUsers.filter((user) => user.highestRoleRank > highestRoleRank);
	}

	return (
		<>
			<TopBar
				buttonHref="/medibook"
				buttonText="Home"
				subheading={`${numberOfUsers} Users`}
				title="All Users"
				defaultSort="officialNameasc"
				searchText="Search users..."
				sortOptions={sortOptions}>
				<SearchParamsButton searchParams={{ "create-user": true }}>Add User</SearchParamsButton>
			</TopBar>

			<SelectedContextProvider defaultUserData={editUsers}>
				<SelectedUsersWindow />
				<div className="relative">
					<Table className="showscrollbar">
						<TableHead>
							<TableRow>
								<TableHeader>
									<span className="sr-only">Select</span>
								</TableHeader>
								<TableHeader>
									<span className="sr-only">Avatar</span>
								</TableHeader>
								<TableHeader>Name</TableHeader>
								<TableHeader>Surname</TableHeader>
								<TableHeader className="invisible md:visible"></TableHeader>
								<TableHeader>Display Name</TableHeader>
								<TableHeader>School</TableHeader>
								<TableHeader>Account Type</TableHeader>
								<TableHeader>Username</TableHeader>
								<TableHeader>User ID</TableHeader>
								<TableHeader>Email</TableHeader>
								<TableHeader>Current Roles</TableHeader>
								<TableHeader>Past & Future Roles</TableHeader>
								<TableHeader className="visible md:invisible"></TableHeader>
							</TableRow>
						</TableHead>

						<TableBody>
							{processedUsers.map((user) => {
								return (
									<TableRow key={user.id}>
										<TableCell>
											<UserSelector
												disabled={highestRoleRank >= user.highestRoleRank}
												uid={user.id}
												displayName={user.displayName}
												officialName={user.officialName}
											/>
										</TableCell>
										<TableCell className="pl-20 md:pl-4">
											<Avatar radius="md" className="my-auto ml-10" showFallback src={`/api/users/${user.id}/avatar`} />
										</TableCell>
										<TableCell>{user.officialName}</TableCell>
										<TableCell>{user.officialSurname}</TableCell>
										<TableCell className="invisible md:min-w-20 min-w-0 md:visible"></TableCell>
										<TableCell>{user.displayName || "-"}</TableCell>
										<TableCell>{user.schoolName || "-"}</TableCell>
										<TableCell>
											<Badge color={userTypeColorMap[user?.type]}>{user?.type}</Badge>
										</TableCell>
										<TableCell>{user.username || "-"}</TableCell>
										<TableCell className="font-mono">
											<UserIdDisplay userId={user.id} />
										</TableCell>
										<TableCell>{user.email || "-"}</TableCell>
										<TableCell>{!!user?.currentRoleNames.length ? <DisplayCurrentRoles user={user} /> : "-"}</TableCell>
										<TableCell>{!!user?.pastRoleNames.length ? <DisplayPastRoles user={user} /> : "-"}</TableCell>
										<TableCell className="visible md:invisible">
											<Dropdown>
												<DropdownButton plain aria-label="More options">
													<Ellipsis width={18} />
												</DropdownButton>
											</Dropdown>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
					<Table className="showscrollbar absolute z-50 top-0 border-r-1 bg-white dark:bg-zinc-900">
						<TableHead>
							<TableRow>
								<TableHeader className="text-white dark:text-black select-none">S</TableHeader>
								<TableHeader>
									<span className="sr-only">Actions</span>
								</TableHeader>
								<TableHeader className="hidden md:table-cell">
									<span className="sr-only">Avatar</span>
								</TableHeader>
								<TableHeader className="hidden md:table-cell">Name</TableHeader>
								<TableHeader className="hidden md:table-cell">Surname</TableHeader>
								<TableHeader className="hidden md:table-cell">
									<span className="sr-only">Space</span>
								</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<UserSelector
											className="mt-2"
											disabled={highestRoleRank >= user.highestRoleRank}
											uid={user.id}
											displayName={user.displayName}
											officialName={user.officialName}
										/>
									</TableCell>
									<TableCell>
										<Dropdown>
											<DropdownButton plain aria-label="More options">
												<Ellipsis width={18} />
											</DropdownButton>
											<DropdownMenu>
												<DropdownItem href={`/medibook/users/${user.username || user.id}`}>View Profile</DropdownItem>
												<SearchParamsDropDropdownItem searchParams={{ "edit-user": user.id }}>Edit User</SearchParamsDropDropdownItem>
												<SearchParamsDropDropdownItem searchParams={{ "assign-roles": user.id }}>Add roles</SearchParamsDropDropdownItem>
												<SearchParamsDropDropdownItem searchParams={{ "edit-roles": user.id }}>Edit roles</SearchParamsDropDropdownItem>
												<SearchParamsDropDropdownItem searchParams={{ "delete-user": user.id }}>Delete user</SearchParamsDropDropdownItem>
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										<Tooltip
											placement="right"
											delay={0}
											isDisabled={!user.profilePicture}
											classNames={{ content: "p-0 select-none" }}
											content={<Image alt="User avatar" src={`/api/users/${user.id}/avatar`} className="h-[13rem] w-[13rem] object-cover" />}>
											<Avatar radius="md" showFallback src={`/api/users/${user.id}/avatar`} />
										</Tooltip>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										<UserTooltip userId={user.id}>{user.officialName}</UserTooltip>
									</TableCell>
									<TableCell className="hidden md:table-cell">{user.officialSurname}</TableCell>
									<TableCell className="hidden md:table-cell">
										<span className="sr-only">Space</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</SelectedContextProvider>
			<Paginator itemsOnPage={users.length} totalItems={numberOfUsers} itemsPerPage={usersPerPage} />
		</>
	);
}
