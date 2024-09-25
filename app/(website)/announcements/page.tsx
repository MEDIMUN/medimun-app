import { authorize, authorizePerRole, authorizePerSession, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { parseOrderDirection } from "@/lib/orderDirection";
import prisma from "@/prisma/client";
import { Button } from "@/components/button";
import Paginator from "@/components/pagination";
import { AnnouncementsTable } from "../server-components";

const itemsPerPage = 10;

export default async function AnnouncementsPage({ searchParams, params }) {
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "title";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const authSession = await auth();

	const whereObject = {
		OR: [
			{
				session: null,
				committeeId: null,
				departmentId: null,
				privacy: { not: { equals: "ANONYMOUS" } },
				title: { contains: query, mode: "insensitive" },
				scope: { hasSome: ["WEBSITE"] },
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

	return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
				<div className="mb-4 lg:px-8">
					<div className="mx-auto max-w-2xl text-left md:text-center">
						<h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Announcements</h2>
						<p className="mt-2 text-lg leading-6 text-gray-600 md:mt-3">
							Global Anouncements and Announcements from the latest session.
							<br />
							This section is under construction and will be made fully functional on the 27th of September, 2024.
						</p>
					</div>
				</div>
				<AnnouncementsTable baseUrl={"/announcements"} announcements={prismaAnnouncements} totalItems={totalItems} />
			</div>
		</div>
	);
}
