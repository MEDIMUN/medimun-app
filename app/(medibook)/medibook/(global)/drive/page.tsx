import { auth } from "@/auth";
import { SearchParamsButton, TopBar } from "../../client-components";
import { MainWrapper, ResourcesTable } from "../../server-components";
import { parseOrderDirection } from "@/lib/order-direction";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import Paginator from "@/components/pagination";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { Suspense } from "react";
import { LoadingTable } from "@/app/components/loading-table";

const itemsPerPage = 10;

const sortOptions = [
	{ value: "name", order: "asc", label: "Name" },
	{ value: "name", order: "desc", label: "Name" },
	{ value: "time", order: "asc", label: "Date Uploaded" },
	{ value: "time", order: "desc", label: "Date Uploaded" },
];

export async function TableOfContents({ props }) {
	const authSession = await auth();
	const searchParams = await props.searchParams;
	const params = await props.params;
	const currentPage = Number(searchParams.page) || 1;
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
			<ResourcesTable
				baseUrl={"/medibook/drive"}
				tableColumns={["Name", "Scope", "Date Uploaded", "Tags"]}
				resources={prismaResources}
				isManagement={isManagement}
			/>
			<Paginator itemsOnPage={prismaResources.length} totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}

export default async function Page(props) {
	return (
		<>
			<TopBar sortOptions={sortOptions} buttonHref="/medibook" buttonText="Home" defaultSort="timedesc" title="Personal Files">
				<SearchParamsButton searchParams={{ uploadresource: true }}>Upload File</SearchParamsButton>
			</TopBar>
			<MainWrapper>
				<Suspense fallback={<LoadingTable columns={["Name", "Scope", "Date Uploaded", "Tags"]} />}>
					<TableOfContents props={props} />
				</Suspense>
			</MainWrapper>
		</>
	);
}
