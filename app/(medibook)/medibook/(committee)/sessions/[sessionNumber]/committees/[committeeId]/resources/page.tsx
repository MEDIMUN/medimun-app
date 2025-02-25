import { auth } from "@/auth";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { ResourcesTable } from "@/app/(medibook)/medibook/server-components";
import { parseOrderDirection } from "@/lib/order-direction";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, authorizePerSession, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import Paginator from "@/components/pagination";
import { notFound } from "next/navigation";
import { ResourcePrivacyTypes } from "@prisma/client";
import { connection } from "next/server";
import { Suspense } from "react";
import { MainWrapper } from "@/components/main-wrapper";

const itemsPerPage = 10;

const sortOptions = [
	{ value: "name", order: "asc", label: "Name" },
	{ value: "name", order: "desc", label: "Name" },
	{ value: "time", order: "asc", label: "Date Uploaded" },
	{ value: "time", order: "desc", label: "Date Uploaded" },
];

export default function Page(props) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CommitteeResources {...props} />
		</Suspense>
	);
}

export async function CommitteeResources(props) {
	await connection();
	const searchParams = await props.searchParams;
	const params = await props.params;
	const currentPage = Number(searchParams.page) || 1;
	const authSession = await auth();
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "name";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const selectedCommittee = await prisma.committee
		.findFirstOrThrow({
			where: {
				OR: [{ id: params.committeeId }, { slug: params.committeeId }],
				session: {
					number: params.sessionNumber,
				},
			},
		})
		.catch(notFound);

	const isManagement = authorize(authSession, [s.management]);
	const isChairOrDelegate =
		authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id) ||
		authorizeDelegateCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	if (!isManagement && !isChairOrDelegate) notFound();

	const hasSomeArray: ResourcePrivacyTypes[] = [
		"COMMITTEEWEBSITE",
		authorizeChairCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], selectedCommittee.id) ? "COMMITTEECHAIR" : null,
		authorizeDelegateCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], selectedCommittee.id) ? "COMMITTEEDELEGATE" : null,
		authorizePerSession(authSession, [s.manager, s.management], [params.sessionNumber]) ? "COMMITTEEMANAGER" : null,
		authorizePerSession(authSession, [s.member, s.management], [params.sessionNumber]) ? "COMMITTEEMEMBER" : null,
		authorizePerSession(authSession, [s.sec, s.management], [params.sessionNumber]) ? "COMMITTEESECRETARIAT" : null,
		authorizePerSession(authSession, [s.director, s.sd], [params.sessionNumber]) ? "COMMITTEEDIRECTORS" : null,
		authorizePerSession(authSession, [s.sd], [params.sessionNumber]) ? "COMMITTEESENIORDIRECTORS" : null,
	].filter((x) => x);

	const whereObject = {
		OR: [
			{
				session: null,
				committeeId: selectedCommittee.id,
				departmentId: null,
				isPrivate: false,
				name: { contains: query, mode: "insensitive" },
				scope: { hasSome: hasSomeArray },
			},
			{
				session: null,
				committeeId: selectedCommittee.id,
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
		include: { user: true },
		orderBy: [{ isPinned: "desc" }, { [orderBy]: orderDirection }],
	});

	const totalItems = await prisma.resource.count({ where: whereObject });

	return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${params.sessionNumber}/committees/${selectedCommittee.slug || selectedCommittee.id}`}
				buttonText={selectedCommittee.name}
				sortOptions={sortOptions}
				defaultSort="timedesc"
				title="Committee Resources">
				{(isManagement || authorizeChairCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], selectedCommittee.id)) && (
					<SearchParamsButton searchParams={{ uploadcommitteeresource: selectedCommittee.id }}>Upload Committee Resource</SearchParamsButton>
				)}
			</TopBar>
			<MainWrapper>
				<ResourcesTable
					baseUrl={`/medibook/sessions/${params.sessionNumber}/committees/${selectedCommittee.slug || selectedCommittee.id}/resources`}
					resources={prismaResources}
					isManagement={isManagement}
				/>
			</MainWrapper>
			<Paginator itemsOnPage={prismaResources.length} totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}
