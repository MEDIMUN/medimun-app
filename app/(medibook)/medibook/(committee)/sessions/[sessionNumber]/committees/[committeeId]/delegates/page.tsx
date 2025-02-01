import { SearchParamsDropDropdownItem, TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { MainWrapper } from "@/components/main-wrapper";
import Paginator from "@/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { countries } from "@/data/countries";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "@/lib/authorize";
import { UserIdDisplay } from "@/lib/display-name";
import prisma from "@/prisma/client";
import { Avatar } from "@heroui/avatar";
import { Ellipsis } from "lucide-react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

const itemsPerPage = 10;

export default function Page(props) {
	return (
		<Suspense fallback={<TopBar title="Committee Delegates" subheading={`Delegates`} />}>
			<Delegates {...props} />;
		</Suspense>
	);
}

export async function Delegates(props: { searchParams: any; params: Promise<{ sessionNumber: string; committeeId: string; page: string }> }) {
	await connection();
	const params = await props.params;
	const searchParams = await props.searchParams;
	const authSession = await auth();
	const currentPage = parseInt(searchParams.page) || 1;
	const isManagement = authorize(authSession, [s.management]);
	const query = searchParams.search || "";

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
						include: {
							ExtraCountry: true,
							delegate: {
								orderBy: { user: { officialName: "asc" } },
								where: {
									OR: [
										{
											user: {
												displayName: {
													contains: query,
													mode: "insensitive",
												},
											},
										},
										{
											user: {
												officialName: {
													contains: query,
													mode: "insensitive",
												},
											},
										},
										{
											user: {
												officialSurname: {
													contains: query,
													mode: "insensitive",
												},
											},
										},
										{
											user: {
												Student: {
													name: {
														contains: query,
														mode: "insensitive",
													},
												},
											},
										},
									],
								},
								take: itemsPerPage,
								skip: (currentPage - 1) * itemsPerPage,
								include: { user: true },
							},
						},
					},
				},
			}),
			prisma.delegate.count({
				where: {
					OR: [
						{
							user: {
								displayName: {
									contains: query,
									mode: "insensitive",
								},
							},
						},
						{
							user: {
								officialName: {
									contains: query,
									mode: "insensitive",
								},
							},
						},
						{
							user: {
								officialSurname: {
									contains: query,
									mode: "insensitive",
								},
							},
						},
						{
							user: {
								Student: {
									name: {
										contains: query,
										mode: "insensitive",
									},
								},
							},
						},
					],
					committee: { session: { number: params.sessionNumber }, OR: [{ id: params.committeeId }, { slug: params.committeeId }] },
				},
			}),
		])
		.catch(notFound);

	const selectedCommittee = selectedSession.committee[0];

	const isChairOfCommittee = authorizeChairCommittee(
		(authSession?.user?.currentRoles || []).concat(authSession?.user?.pastRoles || []),
		selectedCommittee.id
	);
	const isDelegateOfCommittee = authorizeDelegateCommittee(
		(authSession?.user?.currentRoles || []).concat(authSession?.user?.pastRoles || []),
		selectedCommittee.id
	);

	const isPartOfCommittee = isChairOfCommittee || isDelegateOfCommittee;
	const isManagerOrMember = authorize(authSession, [s.manager, s.member]);

	if (!isManagement && !isPartOfCommittee && !isManagerOrMember) notFound();

	const delegates = selectedCommittee?.delegate || [];
	const allCountries = (countries || []).concat(selectedCommittee?.ExtraCountry || []);

	return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${selectedSession.number}/committees/${selectedCommittee.slug || selectedCommittee.id}`}
				buttonText={selectedCommittee.name}
				title="Committee Delegates"
				subheading={`${totalItems} Delegates`}
			/>
			<MainWrapper>
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
								{(isChairOfCommittee || isManagement) && <TableHeader>Email</TableHeader>}
								{(isChairOfCommittee || isManagement) && <TableHeader>User ID</TableHeader>}
							</TableRow>
						</TableHead>
						<TableBody>
							{delegates.map((delegate) => {
								const user = delegate.user;
								const selectedCountry = allCountries.find((country) => country.countryCode === delegate.country);
								const isChairOfDelegate = authorizeChairCommittee(authSession?.user?.currentRoles || [], selectedSession.committee[0].id);
								return (
									<TableRow key={delegate.id}>
										<TableCell>
											<Dropdown>
												<DropdownButton plain>
													<Ellipsis width={18} />
												</DropdownButton>
												<DropdownMenu>
													<DropdownItem href={`/medibook/users/${user.username || user.id}`}>View Profile</DropdownItem>
													<DropdownItem href={`/medibook/users/${user.username || user.id}?new=true`}>Message</DropdownItem>
													{(isChairOfDelegate || isManagement) && (
														<SearchParamsDropDropdownItem
															searchParams={{
																"edit-user": user.id,
															}}>
															Edit User
														</SearchParamsDropDropdownItem>
													)}
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
										{(isChairOfCommittee || isManagement) && <TableCell>{user.email}</TableCell>}
										{(isChairOfCommittee || isManagement) && <TableCell>{<UserIdDisplay userId={user.id} />}</TableCell>}
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
				<Paginator totalItems={totalItems} itemsPerPage={itemsPerPage} itemsOnPage={selectedCommittee.delegate.length} />
			</MainWrapper>
		</>
	);
}
