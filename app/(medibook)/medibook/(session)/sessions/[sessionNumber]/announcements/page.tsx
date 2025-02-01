import { authorize, authorizePerSession, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/order-direction";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { romanize } from "@/lib/romanize";
import { AnnouncementsTable } from "@/global-pages/announcements/announcements-table";

const itemsPerPage = 10;

export default async function AnnouncementsPage(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "title";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	const hasSomeArray = [
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

	const [prismaAnnouncements, totalItems] = await prisma
		.$transaction([
			prisma.announcement.findMany({
				where: whereObject,
				take: itemsPerPage,
				skip: (currentPage - 1) * itemsPerPage,
				include: { user: true, session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
				orderBy: [{ isPinned: "desc" }, { [orderBy]: orderDirection }],
			}),
			prisma.announcement.count({ where: whereObject }),
		])
		.catch(notFound);

	return (
		<AnnouncementsTable
			title={"Session Announcements"}
			baseUrl={`/medibook/sessions/${params.sessionNumber}/announcements`}
			buttonText={`Session ${romanize(params.sessionNumber)}`}
			buttonHref={`/medibook/sessions/${params.sessionNumber}`}
			showPublishButton={isManagement}
			announcements={prismaAnnouncements}
			totalItems={totalItems}
		/>
	);
}
