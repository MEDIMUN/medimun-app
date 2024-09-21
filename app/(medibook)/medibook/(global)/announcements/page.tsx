import { authorize, authorizePerRole, authorizePerSession, s } from "@/lib/authorize";
import { AnnouncementsTable } from "../../server-components";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/orderDirection";
import prisma from "@/prisma/client";
import { TopBar } from "../../client-components";
import { Button } from "@/components/button";
import Paginator from "@/components/pagination";

const itemsPerPage = 10;

export default async function AnnouncementsPage({ searchParams, params }) {
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "title";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const authSession = await auth();

	const hasSomeArray = [
		"WEBSITE",
		authorizePerRole(authSession, [s.chair, s.management]) ? "CHAIR" : null,
		authorizePerRole(authSession, [s.manager, s.management]) ? "MANAGER" : null,
		authorizePerRole(authSession, [s.member, s.management]) ? "MEMBER" : null,
		authorizePerRole(authSession, [s.delegate, s.management]) ? "DELEGATE" : null,
		authorizePerRole(authSession, [s.sec, s.management]) ? "SECRETARIAT" : null,
		authorizePerRole(authSession, [s.schooldirector, s.management]) ? "SCHOOLDIRECTORS" : null,
		authorizePerRole(authSession, [s.director, s.sd]) ? "DIRECTORS" : null,
		authorizePerRole(authSession, [s.sd]) ? "SENIORDIRECTORS" : null,
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
		<AnnouncementsTable
			title={"Global Announcements"}
			showPublishButton={isManagement}
			baseUrl={"/medibook/announcements"}
			announcements={prismaAnnouncements}
			totalItems={totalItems}
		/>
	);
}
