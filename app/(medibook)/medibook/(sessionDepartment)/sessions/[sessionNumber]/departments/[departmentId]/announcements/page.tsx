import { authorizeManagerDepartment, authorizeMemberDepartment, authorizePerSession, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/orderDirection";
import prisma from "@/prisma/client";
import { AnnouncementsTable } from "@/app/(medibook)/medibook/server-components";

export default async function AnnouncementsPage({ searchParams, params }) {
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "title";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const authSession = await auth();

	const selectedEntity = await prisma.department.findFirstOrThrow({
		where: {
			OR: [
				{ id: params.departmentId, session: { number: params.sessionNumber } },
				{ slug: params.departmentId, session: { number: params.sessionNumber } },
			],
		},
		include: { session: true },
	});

	const hasSomeArray = [
		"DEPARTMENTWEBSITE",
		authorizeManagerDepartment([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id) ? "DEPARTMENTMANAGER" : null,
		authorizeMemberDepartment([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id) ? "DEPARTMENTMEMBER" : null,
		authorizePerSession(authSession, [s.manager, s.management], [selectedEntity.session.number]) ? "DEPARTCHAIR" : null,
		authorizePerSession(authSession, [s.member, s.management], [selectedEntity.session.number]) ? "DEPARTMENTDELEGATE" : null,
		authorizePerSession(authSession, [s.sec, s.management], [selectedEntity.session.number]) ? "DEPARTMENTSECRETARIAT" : null,
		authorizePerSession(authSession, [s.schooldirector, s.management], [selectedEntity.session.number]) ? "DEPARTMENTSCHOOLDIRECTORS" : null,
		authorizePerSession(authSession, [s.director, s.sd], [selectedEntity.session.number]) ? "DEPARTMENTDIRECTORS" : null,
		authorizePerSession(authSession, [s.sd], [selectedEntity.session.number]) ? "DEPARTMENTSENIORDIRECTORS" : null,
	].filter((x) => x);

	const whereObject = {
		session: null,
		committeeId: null,
		departmentId: null,
		title: { contains: query, mode: "insensitive" },
		scope: { hasSome: hasSomeArray },
		type: { has: "WEBSITE" },
	};

	const prismaAnnouncements = await prisma.announcement.findMany({
		where: whereObject,
		take: itemsPerPage,
		skip: (currentPage - 1) * itemsPerPage,
		include: { user: true, session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
		orderBy: [{ isPinned: "desc" }, { [orderBy]: orderDirection }],
	});

	const totalItems = await prisma.announcement.count({ where: whereObject });
	return (
		<AnnouncementsTable
			title={"Department Announcements"}
			baseUrl={`/medibook/sessions/${params.sessionNumber}/departments/${params.departmentId}/announcements`}
			announcements={prismaAnnouncements}
			totalItems={totalItems}
		/>
	);
}
