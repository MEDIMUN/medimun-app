import { authorize, authorizePerRole, authorizePerSession, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/order-direction";
import prisma from "@/prisma/client";
import { AnnouncementsTable } from "@/global-pages/announcements/announcements-table";
import { Suspense } from "react";
import { connection } from "next/server";

const itemsPerPage = 10;

export default function Page(props) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Announcements {...props} />
		</Suspense>
	);
}

export async function Announcements(props) {
	await connection();
	const params = await props.params;
	const searchParams = await props.searchParams;
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

	const hasSomeArraySession = [
		"SESSIONWEBSITE",
		authorizePerSession(authSession, [s.management, s.chair], [params.sessionNumber]) ? "SESSIONCHAIR" : null,
		authorizePerSession(authSession, [s.management, s.delegate], [params.sessionNumber]) ? "SESSIONDELEGATE" : null,
		authorizePerSession(authSession, [s.management, s.manager], [params.sessionNumber]) ? "SESSIONMANAGER" : null,
		authorizePerSession(authSession, [s.management, s.member], [params.sessionNumber]) ? "SESSIONMEMBER" : null,
		authorizePerSession(authSession, [s.management, s.sec], [params.sessionNumber]) ? "SESSIONSECRETARIAT" : null,
		authorizePerSession(authSession, [s.management, s.schooldirector], [params.sessionNumber]) ? "SESSIONSCHOOLDIRECTORS" : null,
		authorizePerSession(authSession, [s.director, s.sd], [params.sessionNumber]) ? "SESSIONDIRECTORS" : null,
		authorizePerSession(authSession, [s.sd], [params.sessionNumber]) ? "SESSIONSENIORDIRECTORS" : null,
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
			{
				session: {
					isMainShown: true,
				},
				committeeId: null,
				departmentId: null,
				privacy: { equals: "ANONYMOUS" },
				user: { id: authSession.user.id },
				title: { contains: query, mode: "insensitive" },
				scope: { hasSome: hasSomeArraySession },
				type: { has: "WEBSITE" },
			},
			{
				session: {
					isMainShown: true,
				},
				committeeId: null,
				departmentId: null,
				privacy: { not: { equals: "ANONYMOUS" } },
				title: { contains: query, mode: "insensitive" },
				scope: { hasSome: hasSomeArraySession },
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
			buttonHref="/medibook"
			buttonText="Home"
			title={"Global Announcements"}
			showPublishButton={isManagement}
			baseUrl={"/medibook/announcements"}
			announcements={prismaAnnouncements}
			totalItems={totalItems}
		/>
	);
}
