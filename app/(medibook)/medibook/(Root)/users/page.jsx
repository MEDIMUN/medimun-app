import AddUserModal from "./Drawer";
import prisma from "@/prisma/client";
import Table from "./UsersTable";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AddRolesModal from "./AddRolesModal";
import { userData } from "@/lib/user-data";
import EditRolesModal from "./EditRolesModal";
import { authorize, s } from "@/lib/authorize";

export const metadata = {
	title: "Users",
	description: "See all users",
};

export default async function Page({ params, searchParams }) {
	const session = await getServerSession(authOptions);
	if (!session || !authorize(session, [s.management])) return notFound();
	const usersPerPage = 10;
	const currentPage = Number(searchParams.page) || 1;
	let users, numberOfUsers, userForRolesToBeRemoved;

	let schools = prisma.school.findMany({ orderBy: { name: "asc" }, include: { location: true } }).catch(() => notFound());
	let sessions = prisma.session.findMany();
	let committees = prisma.committee.findMany({ where: { session: { id: searchParams.assign } } }).catch(() => notFound());
	let departments = prisma.department.findMany({ where: { session: { id: searchParams.assign } } }).catch(() => notFound());

	if (searchParams.remove) userForRolesToBeRemoved = userData(searchParams.remove);
	const query = searchParams.query;
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
	if (!searchParams.query) {
		users = prisma.user.findMany({ orderBy: { [orderBy]: searchParams.direction }, include: { account: { select: { id: true, timeCreated: true, lastLogin: true } }, student: { select: { school: true } } }, skip: (currentPage - 1) * usersPerPage, take: usersPerPage }).catch(notFound);
		numberOfUsers = prisma.user.count({ where: { NOT: { id: session.user.id } } }).catch(notFound);
	} else {
		users = prisma.user
			.findMany({
				where: { OR: [{ officialName: { contains: query, mode: "insensitive" } }, { username: { contains: query, mode: "insensitive" } }, { student: { some: { school: { name: { contains: query, mode: "insensitive" } } } } }, { id: { contains: query, mode: "insensitive" } }, { officialSurname: { contains: query, mode: "insensitive" } }, { displayName: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] },
				orderBy: { [orderBy]: searchParams.direction },
				include: { account: { select: { id: true, timeCreated: true, lastLogin: true } }, student: { select: { school: true } } },
				skip: (currentPage - 1) * usersPerPage,
				take: usersPerPage,
			})
			.catch(notFound);
		numberOfUsers = prisma.user
			.count({
				where: { OR: [{ officialName: { contains: query, mode: "insensitive" } }, { username: { contains: query, mode: "insensitive" } }, { student: { some: { school: { name: { contains: query, mode: "insensitive" } } } } }, { id: { contains: query, mode: "insensitive" } }, { officialSurname: { contains: query, mode: "insensitive" } }, { displayName: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] },
			})
			.catch(notFound);
	}
	const highestRoleRank = session.highestRoleRank;
	[schools, users, sessions, committees, departments, numberOfUsers, userForRolesToBeRemoved] = await Promise.all([schools, users, sessions, committees, departments, numberOfUsers, userForRolesToBeRemoved]);
	const numberOfPages = Math.ceil((numberOfUsers || 1) / usersPerPage);
	const usersWithLowerRoles = selectedUsers.filter((user) => {
		return user.highestRoleRank > highestRoleRank;
	});
	return (
		<>
			<EditRolesModal user={userForRolesToBeRemoved} />
			<AddRolesModal committees={committees} departments={departments} schools={schools} sessions={sessions} selectedUsers={usersWithLowerRoles} />
			<AddUserModal users={users} schools={schools} />
			<Table session={session} numberOfPages={numberOfPages} users={users} />
		</>
	);
}
