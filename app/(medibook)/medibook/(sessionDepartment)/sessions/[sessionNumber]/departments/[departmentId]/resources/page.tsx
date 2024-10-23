import { auth } from "@/auth";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { ResourcesTable } from "@/app/(medibook)/medibook/server-components";
import { parseOrderDirection } from "@/lib/orderDirection";
import { authorize, authorizeManagerDepartment, authorizeMemberDepartment, authorizePerSession, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import Paginator from "@/components/pagination";
import { notFound } from "next/navigation";
import { ResourcePrivacyTypes } from "@prisma/client";

const itemsPerPage = 10;

const sortOptions = [
	{ value: "name", order: "asc", label: "Name" },
	{ value: "name", order: "desc", label: "Name" },
	{ value: "time", order: "asc", label: "Date Uploaded" },
	{ value: "time", order: "desc", label: "Date Uploaded" },
];

export default async function Page(props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const currentPage = Number(searchParams.page) || 1;
    const authSession = await auth();
    const query = searchParams.search || "";
    const orderBy = searchParams.order || "name";
    const orderDirection = parseOrderDirection(searchParams.direction);
    const selectedDepartment = await prisma.department
		.findFirstOrThrow({ where: { OR: [{ id: params.departmentId }, { slug: params.departmentId }], session: { number: params.sessionNumber } } })
		.catch(notFound);

    const hasSomeArray: ResourcePrivacyTypes[] = [
		"DEPARTMENTWEBSITE",
		authorizeManagerDepartment([...authSession.user.currentRoles, ...authSession.user.pastRoles], selectedDepartment.id) ? "DEPARTMENTMANAGER" : null,
		authorizeMemberDepartment([...authSession.user.currentRoles, ...authSession.user.pastRoles], selectedDepartment.id) ? "DEPARTMENTMEMBER" : null,
		authorizePerSession(authSession, [s.sec, s.management], [params.sessionNumber]) ? "DEPARTMENTSECRETARIAT" : null,
		authorizePerSession(authSession, [s.director, s.sd], [params.sessionNumber]) ? "DEPARTMENTDIRECTORS" : null,
		authorizePerSession(authSession, [s.sd], [params.sessionNumber]) ? "DEPARTMENTSENIORDIRECTORS" : null,
	].filter((x) => x);

    const whereObject = {
		OR: [
			{
				session: null,
				committeeId: null,
				departmentId: selectedDepartment.id,
				isPrivate: false,
				name: { contains: query, mode: "insensitive" },
				scope: { hasSome: hasSomeArray },
			},
			{
				session: null,
				committeeId: null,
				departmentId: selectedDepartment.id,
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
		include: { user: true },
		orderBy: [{ isPinned: "desc" }, { [orderBy]: orderDirection }],
	});

    const totalItems = await prisma.resource.count({ where: whereObject });

    const isManagement = authorize(authSession, [s.management]);
    return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${params.sessionNumber}/departments/${selectedDepartment.slug || selectedDepartment.id}`}
				buttonText={selectedDepartment.name}
				sortOptions={sortOptions}
				defaultSort="timedesc"
				className="mb-8"
				title="Department Resources">
				<SearchParamsButton searchParams={{ uploaddepartmentresource: true }}>Upload Department Resource</SearchParamsButton>
			</TopBar>
			<ResourcesTable resources={prismaResources} isManagement={isManagement} />
			<Paginator totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}
