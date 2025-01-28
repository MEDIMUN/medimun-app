import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, authorizePerSession, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/order-direction";
import prisma from "@/prisma/client";
import { AnnouncementsTable } from "@/app/(medibook)/medibook/server-components";
import { notFound } from "next/navigation";

const itemsPerPage = 10;

export default async function AnnouncementsPage(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
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

	const isManagement = authorize(authSession, [s.management]);
	const isChairOrDelegate =
		authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id) ||
		authorizeDelegateCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id);
	if (!isManagement && !isChairOrDelegate) notFound();

	const hasSomeArray = [
		"COMMITTEEWEBSITE",
		authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id) ? "COMMITTEECHAIR" : null,
		authorizeDelegateCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id) ? "COMMITTEEDELEGATE" : null,
		authorizePerSession(authSession, [s.manager, s.management], [selectedEntity.session.number]) ? "COMMITTEEMANAGER" : null,
		authorizePerSession(authSession, [s.member, s.management], [selectedEntity.session.number]) ? "COMMITTEEMEMBER" : null,
		authorizePerSession(authSession, [s.sec, s.management], [selectedEntity.session.number]) ? "COMMITTEESECRETARIAT" : null,
		authorizePerSession(authSession, [s.director, s.sd], [selectedEntity.session.number]) ? "COMMITTEEDIRECTORS" : null,
		authorizePerSession(authSession, [s.sd, s.management], [selectedEntity.session.number]) ? "COMMITTEESENIORDIRECTORS" : null,
	].filter((x) => x);

	const whereObject = {
		committeeId: selectedEntity.id,
		departmentId: null,
		title: { contains: query, mode: "insensitive" },
		scope: { hasSome: hasSomeArray },
	};

	const [announcements, totalItems] = await prisma
		.$transaction([
			prisma.announcement.findMany({
				where: whereObject,
				take: itemsPerPage,
				skip: (currentPage - 1) * itemsPerPage,
				include: { user: true, session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
				orderBy: [{ time: "desc" }],
			}),

			prisma.announcement.count({ where: whereObject }),
		])
		.catch(notFound);

	return (
		<AnnouncementsTable
			buttonHref={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}`}
			showPublishButton={
				authorize(authSession, [s.management]) ||
				authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id)
			}
			buttonText={selectedEntity.name}
			title={"Committee Announcements"}
			baseUrl={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/announcements`}
			announcements={announcements}
			totalItems={totalItems}
		/>
	);
}
