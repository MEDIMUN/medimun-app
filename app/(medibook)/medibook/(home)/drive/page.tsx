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

	const whereObject = {
		user: { id: authSession.user.id },
		name: { contains: query, mode: "insensitive" },
	};

	const prismaResources = await prisma.resource.findMany({
		where: whereObject,
		take: itemsPerPage,
		skip: (currentPage - 1) * itemsPerPage,
		include: { user: true, committee: { include: { session: true } }, department: { include: { session: true } }, session: true },
		orderBy: [{ isPinned: "desc" }, { [orderBy]: orderDirection }],
	});

	const totalItems = await prisma.resource.count({ where: whereObject });

	const isManagement = authorize(authSession, [s.management]);
	return (
		<>
			<TopBar
				sortOptions={sortOptions}
				defaultSort="timedesc"
				className="mb-8"
				title="Personal Files"
				subheading="Personal Files & All Resources Uploaded by Me">
				<SearchParamsButton searchParams={{ uploadresource: true }}>Upload File</SearchParamsButton>
			</TopBar>
			<ResourcesTable tableColumns={["Name", "Scope", "Date Uploaded", "Tags"]} resources={prismaResources} isManagement={isManagement} />
			<Paginator totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}
