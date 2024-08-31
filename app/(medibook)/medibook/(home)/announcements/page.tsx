import { authorize, authorizePerSession, s } from "@/lib/authorize";
import { AnnouncementsTable } from "../../server-components";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/orderDirection";
import prisma from "@/prisma/client";
import { TopBar } from "../../client-components";
import { Button } from "@/components/button";
import Paginator from "@/components/Paginator";

const itemsPerPage = 10;

export default async function AnnouncementsPage({ searchParams, params }) {
	const currentPage = Number(searchParams.page) || 1;
	const authSession = await auth();
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "title";
	const orderDirection = parseOrderDirection(searchParams.direction);

	const hasSomeArray = [
		"WEBSITE",
		authorizePerSession(authSession, [s.chair, s.management], [params.sessionNumber]) ? "CHAIR" : null,
		authorizePerSession(authSession, [s.manager, s.management], [params.sessionNumber]) ? "MANAGER" : null,
		authorizePerSession(authSession, [s.member, s.management], [params.sessionNumber]) ? "MEMBER" : null,
		authorizePerSession(authSession, [s.delegate, s.management], [params.sessionNumber]) ? "DELEGATE" : null,
		authorizePerSession(authSession, [s.sec, s.management], [params.sessionNumber]) ? "SECRETARIAT" : null,
		authorizePerSession(authSession, [s.schooldirector, s.management], [params.sessionNumber]) ? "SCHOOLDIRECTORS" : null,
		authorizePerSession(authSession, [s.director, s.sd], [params.sessionNumber]) ? "DIRECTORS" : null,
		authorizePerSession(authSession, [s.sd], [params.sessionNumber]) ? "SENIORDIRECTORS" : null,
	].filter((x) => x);

	const whereObject = {
		OR: [
			{
				session: null,
				committeeId: null,
				departmentId: null,
				privacy: { not: { equals: "ANONYMOUS" } },
				title: { contains: query, mode: "insensitive" },
				scope: { hasSome: hasSomeArray },
				type: { has: "WEBSITE" },
			},
			{
				session: null,
				committeeId: null,
				departmentId: null,
				privacy: { equals: "ANONYMOUS" },
				user: { id: authSession.user.id },
				title: { contains: query, mode: "insensitive" },
				scope: { hasSome: hasSomeArray },
				type: { has: "WEBSITE" },
			},
		],
	};

	const prismaAnnouncements = await prisma.announcement.findMany({
		where: whereObject,
		take: itemsPerPage,
		skip: (currentPage - 1) * itemsPerPage,
		include: { user: true, session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
		orderBy: [{ isPinned: "desc" }, { [orderBy]: orderDirection }],
	});

	const totalItems = await prisma.announcement.count({ where: whereObject });

	const isManagement = authorize(authSession, [s.management]);
	return (
		<>
			<AnnouncementsTable
				title={"Global Announcements"}
				baseUrl={"/medibook/announcements"}
				isManagement={isManagement}
				announcements={prismaAnnouncements}
			/>
			<Paginator totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}
