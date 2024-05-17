import AddUserModal from "./modals";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AddRolesModal from "./AddRolesModal";
import { generateUserData, userData } from "@/lib/user-data";
import EditRolesModal from "./EditRolesModal";
import { authorize, s } from "@/lib/authorize";
import SearchBar from "../resources/SearchBar";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import Icon from "@/components/icon";
import { AnswersButton, EditButton } from "./Buttons";

export const metadata = {
	title: "Users",
	description: "See all users",
};

export default async function Page({ params, searchParams }) {
	const session = await getServerSession(authOptions);
	if (!session || !authorize(session, [s.management])) return notFound();
	const usersPerPage = 10;
	const currentPage = Number(searchParams.page) || 1;
	let users,
		numberOfUsers = 100,
		userForRolesToBeRemoved;

	let schools = prisma.school.findMany({ orderBy: { name: "asc" }, include: { location: true } }).catch(notFound);
	let sessions = prisma.session.findMany();
	let committees = prisma.committee.findMany({ where: { session: { id: searchParams.assign } } }).catch(notFound);
	let departments = prisma.department.findMany({ where: { session: { id: searchParams.assign } } }).catch(notFound);

	if (searchParams.remove) userForRolesToBeRemoved = userData(searchParams.remove);
	const query = searchParams.search;
	let orderBy = searchParams.orderBy;
	let selectedUsers = [];
	if (searchParams.selected) {
		const selectQuery = searchParams.selected.split(",");
		for (const userId of selectQuery) {
			const user = await userData(userId);
			if (user) selectedUsers.push(user);
		}
	}

	//if orderBy is one of the following, then it is a valid orderBy: officialName, id, email, officialSurname, displayName, username
	if (!["officialName", "id", "email", "officialSurname", "displayName", "username"].includes(orderBy)) orderBy = "officialName";

	users = await prisma.user
		.findMany({
			where: {
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
						OR: [{ officialName: { contains: query, mode: "insensitive" } }, { username: { contains: query, mode: "insensitive" } }, { id: { contains: query, mode: "insensitive" } }, { officialSurname: { contains: query, mode: "insensitive" } }, { displayName: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
					},
				],
			},
			include: {
				globalAdmin: true,
				admin: true,
				seniorDirecor: true,
				Director: true,
				Student: true,
				delegate: { include: { committee: { select: { session: true, name: true, id: true, slug: true } } } },
				chair: { include: { committee: { select: { session: true, name: true, id: true, slug: true } } } },
				member: { include: { department: { select: { session: true, name: true, id: true, slug: true } } } },
				manager: { include: { department: { select: { session: true, name: true, id: true, slug: true } } } },
				schoolDirector: { include: { school: true, session: { select: { isCurrent: true, number: true, id: true } } } },
				secretaryGeneral: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
				presidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
				deputySecretaryGeneral: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
				deputyPresidentOfTheGeneralAssembly: { include: { session: { select: { isCurrent: true, number: true, id: true } } } },
			},
			orderBy: [{ officialName: "asc" }, { officialSurname: "asc" }],
			skip: (currentPage - 1) * usersPerPage,
			take: usersPerPage,
		})
		.catch(notFound);

	const highestRoleRank = session.highestRoleRank;
	[schools, users, sessions, committees, departments, numberOfUsers, userForRolesToBeRemoved] = await Promise.all([schools, users, sessions, committees, departments, numberOfUsers, userForRolesToBeRemoved]);
	const usersWithLowerRoles = selectedUsers.filter((user) => {
		return user.highestRoleRank > highestRoleRank;
	});
	const usersWithRoles = users.map((user) => generateUserData(user));

	const isManagement = authorize(session, [s.management]);
	const isChair = authorize(session, [s.chair]);
	const isManager = authorize(session, [s.manager]);

	return (
		<>
			<EditRolesModal user={userForRolesToBeRemoved} />
			<AddRolesModal committees={committees} departments={departments} schools={schools} sessions={sessions} selectedUsers={usersWithLowerRoles} />
			<AddUserModal users={users} schools={schools} />
			<ul className="grid w-full gap-4">
				{users.map((user, index) => {
					const fullName = `${user.officialName} ${user.officialSurname}`;
					return (
						<li key={index} className="-border flex w-full flex-col gap-2 rounded-xl border-black/10 bg-content1/60 p-4 dark:border-white/20 md:flex-row">
							<div className="flex">
								<Avatar isBordered className="my-auto ml-1 mr-4" showFallback src={`/api/users/${user.id}/avatar`} />
								<div className="flex flex-col gap-1">
									<div className="flex gap-2">
										<p className="mb-[-10px] bg-gradient-to-br from-foreground-800 to-foreground-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent dark:to-foreground-200">{fullName}</p>
									</div>
									<h1 className="mt-1 text-default-400">{user?.Student?.name || "No school assigned"}</h1>
								</div>
							</div>
							<div className="my-auto ml-auto flex gap-2">
								<Button as={Link} href={`/medibook/users/${user.username || user.id}`} isIconOnly endContent={<Icon className="" icon="solar:user-outline" width={22} />} fullWidth className="-border-small w-auto border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10"></Button>
								<EditButton id={user.id} />
							</div>
						</li>
					);
				})}
			</ul>
		</>
	);
}
