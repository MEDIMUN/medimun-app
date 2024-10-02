import { auth } from "@/auth";
import { SearchParamsButton, TopBar } from "../../client-components";
import { ResourcesTable } from "../../server-components";
import { parseOrderDirection } from "@/lib/orderDirection";
import { authorize, authorizePerSession, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import Paginator from "@/components/pagination";

const itemsPerPage = 10;

const sortOptions = [
	{ value: "name", order: "asc", label: "Name" },
	{ value: "name", order: "desc", label: "Name" },
	{ value: "time", order: "asc", label: "Date Uploaded" },
	{ value: "time", order: "desc", label: "Date Uploaded" },
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
			<TopBar sortOptions={sortOptions} buttonHref="/medibook" buttonText="Home" defaultSort="timedesc" title="Personal Files">
				<SearchParamsButton searchParams={{ uploadresource: true }}>Upload File</SearchParamsButton>
			</TopBar>
			<ResourcesTable tableColumns={["Name", "Scope", "Date Uploaded", "Tags"]} resources={prismaResources} isManagement={isManagement} />
			<Paginator itemsOnPage={prismaResources.length} totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}
