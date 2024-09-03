import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, authorizePerRole, authorizePerSession, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/orderDirection";
import prisma from "@/prisma/client";
import { AnnouncementsTable } from "@/app/(medibook)/medibook/server-components";

const itemsPerPage = 10;

export default async function AnnouncementsPage({ searchParams, params }) {
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "title";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const authSession = await auth();

	const selectedEntity = await prisma.committee.findFirstOrThrow({
		where: {
			OR: [
				{ id: params.committeeId, session: { number: params.sessionNumber } },
				{ slug: params.committeeId, session: { number: params.sessionNumber } },
			],
		},
		include: { session: true },
	});

	const hasSomeArray = [
		"COMMITTEEWEBSITE",
		authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id) ? "COMMITTEECHAIR" : null,
		authorizeDelegateCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id) ? "COMMITTEEDELEGATE" : null,
		authorizePerSession(authSession, [s.manager, s.management], [selectedEntity.session.number]) ? "COMMITTEEMANAGER" : null,
		authorizePerSession(authSession, [s.member, s.management], [selectedEntity.session.number]) ? "COMMITTEEMEMBER" : null,
		authorizePerSession(authSession, [s.sec, s.management], [selectedEntity.session.number]) ? "COMMITTEESECRETARIAT" : null,
		authorizePerSession(authSession, [s.schooldirector, s.management], [selectedEntity.session.number]) ? "COMMITTEESCHOOLDIRECTORS" : null,
		authorizePerSession(authSession, [s.director, s.sd], [selectedEntity.session.number]) ? "COMMITTEEDIRECTORS" : null,
		authorizePerSession(authSession, [s.sd], [selectedEntity.session.number]) ? "COMMITTEESENIORDIRECTORS" : null,
	].filter((x) => x);

	const whereObject = {
		committeeId: selectedEntity.id,
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
			buttonHref={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}`}
			buttonText={selectedEntity.name}
			title={"Committee Announcements"}
			baseUrl={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/announcements`}
			announcements={prismaAnnouncements}
			totalItems={totalItems}
		/>
	);
}
