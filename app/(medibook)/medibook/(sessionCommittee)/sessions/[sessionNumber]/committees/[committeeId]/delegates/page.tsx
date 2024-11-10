import { TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import Paginator from "@/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { countries } from "@/data/countries";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { Avatar } from "@nextui-org/avatar";
import { notFound } from "next/navigation";

const itemsPerPage = 10;

//FIX
export default async function Page(props: { params: Promise<{ sessionNumber: string; committeeId: string; page: string }> }) {
	const params = await props.params;
	const authSession = await auth();
	const currentPage = parseInt(params.page) || 1;
	const isManagement = authorize(authSession, [s.management]);

	const [selectedSession, totalItems] = await prisma
		.$transaction([
			prisma.session.findFirstOrThrow({
				where: {
					number: params.sessionNumber,
					...(isManagement ? {} : { isPartlyVisible: true }),
				},
				include: {
					committee: {
						where: { OR: [{ id: params.committeeId }, { slug: params.committeeId }] },
						take: 1,
						include: { ExtraCountry: true, delegate: { take: itemsPerPage, skip: (currentPage - 1) * itemsPerPage, include: { user: true } } },
					},
				},
			}),
			prisma.delegate.count({
				where: { committee: { session: { number: params.sessionNumber }, OR: [{ id: params.committeeId }, { slug: params.committeeId }] } },
			}),
		])
		.catch(notFound);

	const selectedCommittee = selectedSession.committee[0];

	const isChairOfCommittee = authorizeChairCommittee([...authSession?.user?.currentRoles, ...authSession?.user?.pastRoles], selectedCommittee.id);
	const isDelegateOfCommittee = authorizeDelegateCommittee(
		[...authSession?.user?.currentRoles, ...authSession?.user?.pastRoles],
		selectedCommittee.id
	);

	console.log(authSession?.currentRoles);

	const isPartOfCommittee = isChairOfCommittee || isDelegateOfCommittee;
	const isManagerOrMember = authorize(authSession, [s.manager, s.member]);

	if (!isManagement && !isPartOfCommittee && !isManagerOrMember) notFound();

	const delegates = selectedCommittee.delegate;
	const allCountries = [...countries, ...selectedCommittee.ExtraCountry];

	return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${selectedSession.number}/committees/${selectedCommittee.slug || selectedCommittee.id}`}
				buttonText={selectedCommittee.name}
				title="Delegates"
			/>
			{!!selectedCommittee.delegate.length && (
				<Table>
					<TableHead>
						<TableRow>
							<TableHeader>
								<span className="sr-only">Actions</span>
							</TableHeader>
							<TableHeader>
								<span className="sr-only">Avatar</span>
							</TableHeader>
							<TableHeader>Name</TableHeader>
							<TableHeader>Country</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{delegates.map((delegate) => {
							const user = delegate.user;
							const selectedCountry = allCountries.find((country) => country.countryCode === delegate.country);
							return (
								<TableRow key={delegate.id}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain>
												<EllipsisVerticalIcon />
											</DropdownButton>
											<DropdownMenu>
												<DropdownItem href={`/medibook/users/${user.username || user.id}`}>View Profile</DropdownItem>
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>
										<UserTooltip userId={user.id}>
											<Avatar showFallback radius="md" src={`/api/users/${user.id}/avatar`} />
										</UserTooltip>
									</TableCell>
									<TableCell>{user.displayName || `${user.officialName} ${user.officialSurname}`}</TableCell>
									<TableCell>{selectedCountry?.countryNameEn || "Not Assigned"}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}
			<Paginator totalItems={totalItems} itemsPerPage={itemsPerPage} itemsOnPage={selectedCommittee.delegate.length} />
		</>
	);
}
