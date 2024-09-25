import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import Paginator from "@/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { countries } from "@/data/countries";
import { authorize, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { Avatar } from "@nextui-org/avatar";
import { notFound } from "next/navigation";

const itemsPerPage = 10;

export default async function Page({ params }: { params: { sessionNumber: string; committeeId: string; page: string } }) {
	const authSession = await auth();
	const currentPage = parseInt(params.page) || 1;
	const isManagement = authorize(authSession, [s.management]);

	const [selectedSession, totalItems] = await prisma.$transaction([
		prisma.session.findFirstOrThrow({
			where: {
				number: params.sessionNumber,
				...(isManagement ? {} : { isVisible: true }),
			},
			include: {
				committee: {
					where: {
						OR: [{ id: params.committeeId }, { slug: params.committeeId }],
					},
					take: 1,
					include: {
						ExtraCountry: true,
						delegate: {
							take: itemsPerPage,
							skip: (currentPage - 1) * itemsPerPage,
							include: { user: true, },
						},
					},
				},
			},
		}),
		prisma.delegate.count({
			where: { committee: { session: { number: params.sessionNumber }, OR: [{ id: params.committeeId }, { slug: params.committeeId }] } },
		}),
	]);

	const selectedCommittee = selectedSession.committee[0];
	const delegates = selectedCommittee.delegate;
	const allCountries = countries.push(selectedCommittee.ExtraCountry.map((c) => c.name));

	return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${selectedSession.number}/committees/${selectedCommittee.slug || selectedCommittee.id}`}
				buttonText={selectedCommittee.name}
				title="Committee Delegates"
			/>
			<Table>
				<TableHead>
					<TableRow>
						<TableHeader>
							<span className="sr-only">Actions</span>
						</TableHeader>
						<TableHeader>Avatar</TableHeader>
						<TableHeader>Name</TableHeader>
						<TableHeader>Country</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{delegates.map((delegate) => {
						const user = delegate.user;
						return (
							<TableRow key={delegate.id}>
								<TableCell></TableCell>
								<TableCell>
									<Avatar showFallback className="text-primary dark:bg-zinc-900" size="sm" src={`/api/users/${user.id}/avatar`} />
								</TableCell>
								<TableCell>{user.displayName || `${user.officialName} ${user.officialSurname}`}</TableCell>
								<TableCell>{delegate.country}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<Paginator totalItems={totalItems} itemsPerPage={itemsPerPage} itemsOnPage={selectedCommittee.delegate.length} />
		</>
	);
}
