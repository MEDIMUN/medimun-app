import { authorize, authorizeManagerDepartment, authorizeMemberDepartment, authorizePerSession, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/order-direction";
import prisma from "@/prisma/client";
import { AnnouncementsTable } from "@/app/(medibook)/medibook/server-components";
import { notFound } from "next/navigation";

export default async function AnnouncementsPage(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "title";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const authSession = await auth();

	if (!authSession) notFound();

	const selectedEntity = await prisma.department.findFirstOrThrow({
		where: {
			OR: [
				{ id: params.departmentId, session: { number: params.sessionNumber } },
				{ slug: params.departmentId, session: { number: params.sessionNumber } },
			],
		},
		include: { session: true },
	});

	const isManagement = authorize(authSession, [s.management]);
	const isManagerOfDepartment = authorizeManagerDepartment(authSession.user.currentRoles, selectedEntity.id);
	const isMemberOfDepartment = authorizeMemberDepartment(authSession.user.currentRoles, selectedEntity.id);

	if (!isManagement && !isManagerOfDepartment && !isMemberOfDepartment) notFound();

	const hasSomeArray = [
		"DEPARTMENTWEBSITE",
		authorizeManagerDepartment([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id) ? "DEPARTMENTMANAGER" : null,
		authorizeMemberDepartment([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedEntity.id) ? "DEPARTMENTMEMBER" : null,
		authorizePerSession(authSession, [s.manager, s.management], [selectedEntity.session.number]) ? "DEPARTCHAIR" : null,
		authorizePerSession(authSession, [s.member, s.management], [selectedEntity.session.number]) ? "DEPARTMENTDELEGATE" : null,
		authorizePerSession(authSession, [s.sec, s.management], [selectedEntity.session.number]) ? "DEPARTMENTSECRETARIAT" : null,
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

	const [prismaAnnouncements, totalItems] = await prisma
		.$transaction([
			prisma.announcement.findMany({
				where: whereObject,
				take: 10,
				skip: (currentPage - 1) * 10,
				include: { user: true, session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
				orderBy: [{ isPinned: "desc" }, { [orderBy]: orderDirection }],
			}),
			prisma.announcement.count({ where: whereObject }),
		])
		.catch(notFound);

	return (
		<AnnouncementsTable
			buttonHref={`/medibook/sessions/${selectedEntity.session.number}/departments/${selectedEntity.slug || selectedEntity.id}`}
			buttonText={selectedEntity.name}
			showPublishButton={isManagement || isManagerOfDepartment}
			title={"Department Announcements"}
			baseUrl={`/medibook/sessions/${params.sessionNumber}/departments/${params.departmentId}/announcements`}
			announcements={prismaAnnouncements}
			totalItems={totalItems}
		/>
	);
}
