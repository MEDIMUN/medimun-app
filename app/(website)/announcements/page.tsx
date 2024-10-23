import { authorize, authorizePerRole, authorizePerSession, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/orderDirection";
import prisma from "@/prisma/client";
import { Button } from "@/components/button";
import Paginator from "@/components/pagination";
import { AnnouncementsTable, Topbar } from "../server-components";

const itemsPerPage = 10;

export default async function AnnouncementsPage(props) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams.page) || 1;
    const query = searchParams.search || "";
    const orderBy = searchParams.order || "title";
    const orderDirection = parseOrderDirection(searchParams.direction);

    const whereObject = {
		OR: [
			{
				session: null,
				committeeId: null,
				departmentId: null,
				title: { contains: query, mode: "insensitive" },
				scope: { hasSome: ["WEBSITE"] },
				type: { has: "WEBSITE" },
			},
			{
				session: { isMainShown: true },
				committeeId: null,
				departmentId: null,
				title: { contains: query, mode: "insensitive" },
				privacy: { not: { equals: "ANONYMOUS" } },
				scope: { hasSome: ["SESSIONWEBSITE"] },
			},
		],
	};

    const [prismaAnnouncements, totalItems] = await prisma.$transaction([
		prisma.announcement.findMany({
			where: whereObject,
			take: itemsPerPage,
			skip: (currentPage - 1) * itemsPerPage,
			include: { user: true, session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
			orderBy: [{ isPinned: "desc" }, { [orderBy]: orderDirection }],
		}),
		prisma.announcement.count({ where: whereObject }),
	]);

    return (
		<>
			<Topbar title={"Announcements"} description={"Global Announcements and Announcements from the latest session."} />
			<div className="py-12 sm:py-12">
				<div className="mx-auto max-w-2xl px-2 lg:max-w-7xl lg:px-2">
					<AnnouncementsTable baseUrl={"/announcements"} announcements={prismaAnnouncements} totalItems={totalItems} />
				</div>
			</div>
		</>
	);
}
