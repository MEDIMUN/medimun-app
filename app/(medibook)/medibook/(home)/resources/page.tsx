import { auth } from "@/auth";
import { SearchParamsButton, TopBar } from "../../client-components";
import { ResourcesTable } from "../../server-components";
import { parseOrderDirection } from "@/lib/orderDirection";
import { authorize, authorizePerSession, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import Paginator from "@/components/Paginator";

const itemsPerPage = 10;

const sortOptions = [
	{ value: "name", order: "asc", label: "Name", description: "Ascending" },
	{ value: "name", order: "desc", label: "Name", description: "Descending" },
	{ value: "time", order: "asc", label: "Date Uploaded", description: "Ascending" },
	{ value: "time", order: "desc", label: "Date Uploaded", description: "Descending" },
];

export default async function Page({ params, searchParams }) {
	const currentPage = Number(searchParams.page) || 1;
	const authSession = await auth();
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "name";
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
				isPrivate: false,
				name: { contains: query, mode: "insensitive" },
				scope: { hasSome: hasSomeArray },
			},
			{
				session: null,
				committeeId: null,
				departmentId: null,
				isPrivate: true,
				user: { id: authSession.user.id },
				name: { contains: query, mode: "insensitive" },
				scope: { hasSome: hasSomeArray },
			},
		],
	};

	const prismaResources = await prisma.resource.findMany({
		where: whereObject,
		take: itemsPerPage,
		skip: (currentPage - 1) * itemsPerPage,
		include: { user: true, session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
		orderBy: [{ isPinned: "desc" }, { [orderBy]: orderDirection }],
	});

	const totalItems = await prisma.resource.count({ where: whereObject });

	const isManagement = authorize(authSession, [s.management]);
	return (
		<>
			<TopBar sortOptions={sortOptions} defaultSort="timedesc" className="mb-8" title="Global Resources">
				<SearchParamsButton searchParams={{ uploadglobalresource: true }}>Upload Global Resource</SearchParamsButton>
			</TopBar>
			<ResourcesTable resources={prismaResources} isManagement={isManagement} />
			<Paginator totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}
