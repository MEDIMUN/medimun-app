import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, authorizePerRole, authorizePerSession, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/orderDirection";
import prisma from "@/prisma/client";
import { AnnouncementsTable } from "@/app/(medibook)/medibook/server-components";
import { notFound } from "next/navigation";

const itemsPerPage = 10;

export default async function AnnouncementsPage({ searchParams, params }) {
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "title";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const authSession = await auth();

	const hasSomeArray = [
		"SESSIONWEBSITE",
		authorizePerSession(authSession, [s.management, s.chair], [params.sessionNumber]) ? "SESSIONCHAIR" : null,
		authorizePerSession(authSession, [s.management, s.delegate], [params.sessionNumber]) ? "SESSIONDELEGATE" : null,
		authorizePerSession(authSession, [s.manager, s.management], [params.sessionNumber]) ? "SESSIONMANAGER" : null,
		authorizePerSession(authSession, [s.member, s.management], [params.sessionNumber]) ? "SESSIONMEMBER" : null,
		authorizePerSession(authSession, [s.sec, s.management], [params.sessionNumber]) ? "SESSIONSECRETARIAT" : null,
		authorizePerSession(authSession, [s.schooldirector, s.management], [params.sessionNumber]) ? "SESSIONSCHOOLDIRECTORS" : null,
		authorizePerSession(authSession, [s.director, s.sd], [params.sessionNumber]) ? "SESSIONDIRECTORS" : null,
		authorizePerSession(authSession, [s.sd], [params.sessionNumber]) ? "SESSIONSENIORDIRECTORS" : null,
	].filter((x) => x);

	const whereObject = {
		OR: [
			{
				session: { number: params.sessionNumber },
				committeeId: null,
				departmentId: null,
				privacy: { not: { equals: "ANONYMOUS" } },
				title: { contains: query, mode: "insensitive" },
				scope: { hasSome: hasSomeArray },
				type: { has: "WEBSITE" },
			},
			{
				session: { number: params.sessionNumber },
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

	const prismaAnnouncements = await prisma.announcement
		.findMany({
			where: whereObject,
			take: itemsPerPage,
			skip: (currentPage - 1) * itemsPerPage,
			include: { user: true, session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
			orderBy: [{ isPinned: "desc" }, { [orderBy]: orderDirection }],
		})
		.catch(notFound);

	const totalItems = await prisma.announcement.count({ where: whereObject }).catch(notFound);
	return (
		<AnnouncementsTable
			title={"Session Announcements"}
			baseUrl={`/medibook/sessions/${params.sessionNumber}/announcements`}
			announcements={prismaAnnouncements}
			totalItems={totalItems}
		/>
	);
}
