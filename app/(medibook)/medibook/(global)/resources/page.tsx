import { auth } from "@/auth";
import { SearchParamsButton, TopBar } from "../../client-components";
import { ResourcesTable } from "../../server-components";
import { parseOrderDirection } from "@/lib/orderDirection";
import { authorize, authorizePerRole, authorizePerSession, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import Paginator from "@/components/pagination";

const itemsPerPage = 10;

const sortOptions = [
	{ value: "name", order: "asc", label: "Name", description: "Ascending" },
	{ value: "name", order: "desc", label: "Name", description: "Descending" },
	{ value: "time", order: "asc", label: "Date Uploaded", description: "Ascending" },
	{ value: "time", order: "desc", label: "Date Uploaded", description: "Descending" },
];

export default async function Page({ params, searchParams }) {
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "name";
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
			<TopBar sortOptions={sortOptions} defaultSort="timedesc" title="Global Resources">
				<SearchParamsButton searchParams={{ uploadglobalresource: true }}>Upload Global Resource</SearchParamsButton>
			</TopBar>
			<ResourcesTable resources={prismaResources} isManagement={isManagement} />
			<Paginator itemsOnPage={prismaResources.length} totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}
