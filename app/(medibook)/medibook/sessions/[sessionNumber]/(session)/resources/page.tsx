import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { authorize, authorizePerSession, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import { parseOrderDirection } from "@/lib/orderDirection";
import { Paginator } from "@/components/Paginator";
import { ResourcesTable } from "@/app/(medibook)/medibook/server-components";

const itemsPerPage = 10;

const sortOptions = [
	{ value: "name", order: "asc", label: "Name", description: "Ascending" },
	{ value: "name", order: "desc", label: "Name", description: "Descending" },
	{ value: "time", order: "asc", label: "Date Uploaded", description: "Ascending" },
	{ value: "time", order: "desc", label: "Date Uploaded", description: "Descending" },
];

export default async function Page({ params, searchParams }) {
	const authSession = await auth();
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "name";
	const orderDirection = parseOrderDirection(searchParams.direction);

	const isManagement = authorize(authSession, [s.management]);

	const hasSomeArray = [
		"SESSIONWEBSITE",
		"SESSIONPROSPECTUS",
		authorizePerSession(authSession, [s.chair, s.management], [params.sessionNumber]) ? "SESSIONCHAIR" : null,
		authorizePerSession(authSession, [s.manager, s.management], [params.sessionNumber]) ? "SESSIONMANAGER" : null,
		authorizePerSession(authSession, [s.chair, s.management], [params.sessionNumber]) ? "SESSIONCHAIR" : null,
		authorizePerSession(authSession, [s.member, s.management], [params.sessionNumber]) ? "SESSIONMEMBER" : null,
		authorizePerSession(authSession, [s.delegate, s.management], [params.sessionNumber]) ? "SESSIONDELEGATE" : null,
		authorizePerSession(authSession, [s.sec, s.management], [params.sessionNumber]) ? "SESSIONSECRETARIAT" : null,
		authorizePerSession(authSession, [s.schooldirector, s.management], [params.sessionNumber]) ? "SESSIONSCHOOLDIRECTORS" : null,
		authorizePerSession(authSession, [s.director, s.sd], [params.sessionNumber]) ? "SESSIONDIRECTORS" : null,
		authorizePerSession(authSession, [s.sd], [params.sessionNumber]) ? "SESSIONSENIORDIRECTORS" : null,
	].filter((x) => x);

	const whereObject = {
		OR: [
			{
				session: { number: params.sessionNumber },
				committeeId: null,
				departmentId: null,
				isPrivate: false,
				name: { contains: query, mode: "insensitive" },
				scope: { hasSome: hasSomeArray },
			},
			{
				session: { number: params.sessionNumber },
				isPrivate: true,
				committeeId: null,
				departmentId: null,
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
		orderBy: [{ [orderBy]: orderDirection }],
	});

	const totalItems = await prisma.resource.count({ where: whereObject });

	return (
		<>
			<TopBar
				sortOptions={sortOptions}
				defaultSort="timedesc"
				buttonHref={`/medibook/sessions/${params.sessionNumber}`}
				buttonText={`Session ${romanize(params.sessionNumber)}`}
				title="Session Resources"
				className="mb-8">
				{isManagement && <SearchParamsButton searchParams={{ uploadsessionresource: params.sessionNumber }}>Upload Resource</SearchParamsButton>}
			</TopBar>
			<ResourcesTable resources={prismaResources} isManagement={isManagement} />
			<Paginator totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}
