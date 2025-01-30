import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";

import Paginator from "@/components/pagination";
import { Link } from "@/components/link";
import { parseOrderDirection } from "@/lib/order-direction";
import { Badge } from "@/components/badge";
import { Fragment } from "react";
import { romanize } from "@/lib/romanize";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Ellipsis } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";

const itemsPerPage = 10;

const rows = [
	<span key="actions" className="sr-only">
		Actions
	</span>,
	"Name",
	"Current Directors",
	"Country Choices",
	"Delegate Assignment",
	"Payment",
];

//if not a simple object pass it as json string like "ApplicationDelegationPreferences:{_count:'desc'}"
const sortOptions = [
	{ value: "name", order: "asc", label: "Name" },
	{ value: "name", order: "desc", label: "Name" },
	{ value: "ApplicationDelegationPreferences", order: '{"_count":"desc"}', label: "Country Choices" },
	{ value: "ApplicationDelegationPreferences", order: '{"_count":"asc"}', label: "Country Choices" },
	{ value: "ApplicationGrantedDelegationCountries", order: '{"_count":"desc"}', label: "Country Assignment" },
	{ value: "ApplicationGrantedDelegationCountries", order: '{"_count":"asc"}', label: "Country Assignment" },
	{ value: "SchoolDelegationProposal", order: '{"_count":"desc"}', label: "Delegate Assignment Proposal" },
	{ value: "SchoolDelegationProposal", order: '{"_count":"asc"}', label: "Delegate Assignment Proposal" },
	{ value: "finalDelegation", order: '{"_count":"desc"}', label: "Final Delegation" },
	{ value: "finalDelegation", order: '{"_count":"asc"}', label: "Final Delegation" },
];

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const currentPage = parseInt(searchParams.page) || 1;
	const query = searchParams.search || "";
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) notFound();
	const orderBy = searchParams.order || "name";
	const queryObject = {
		where: {
			name: { contains: query, mode: "insensitive" },
			OR: [
				{ ApplicationSchoolDirector: { some: { isApproved: true, session: { number: props.sessionNumber } } } },
				{ name: query ? "" : "The English School" },
			],
		},
	};
	const orderDirection = parseOrderDirection(searchParams.direction);
	const [schools, numberOfSchools] = await prisma
		.$transaction([
			prisma.school.findMany({
				...(queryObject as any),
				orderBy: { [orderBy]: orderDirection },
				include: {
					location: true,
					director: { where: { session: { number: params.sessionNumber } }, select: { user: true } },
					ApplicationDelegationPreferences: { where: { session: { number: params.sessionNumber } } },
					ApplicationGrantedDelegationCountries: { where: { session: { number: params.sessionNumber } } },
					SchoolDelegationProposal: { where: { session: { number: params.sessionNumber } } },
					finalDelegation: { where: { session: { number: params.sessionNumber } } },
				},
				take: itemsPerPage,
				skip: (currentPage - 1) * itemsPerPage,
			}),
			prisma.school.count(queryObject as any),
		])
		.catch(notFound);

	return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${params.sessionNumber}/applications`}
				buttonText={`Session ${romanize(params.sessionNumber)} Applications`}
				subheading={`${numberOfSchools} Schools`}
				sortOptions={sortOptions}
				title={`Application Status`}
				defaultSort="nameasc"
				searchText="Search schools..."
			/>
			<MainWrapper>
				{!!numberOfSchools && (
					<Table className="showscrollbar">
						<TableHead>
							<TableRow>
								{rows.map((row, i) => (
									<TableHeader key={i}>{row}</TableHeader>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{schools.map((school, index) => {
								const directors = school.director.map((director, index) => (
									<Fragment key={index}>
										<Link className="text-primary hover:underline" href={`/medibook/users/${director.user.username || director.user.id}`}>
											{director.user.displayName || `${director.user.officialName} ${director.user.officialSurname}`}
										</Link>
										<span>{index < school.director.length - 1 ? ", " : ""}</span>
									</Fragment>
								));
								return (
									<TableRow href={!school.director.length ? `/medibook/schools/${school.slug || school.id}` : null} key={school.id}>
										<TableCell>
											<Dropdown>
												<DropdownButton plain>
													<Ellipsis width={18} />
												</DropdownButton>
												<DropdownMenu anchor="right">
													<DropdownItem href={`/medibook/schools/${school.slug || school.id}`}>View School</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</TableCell>
										<TableCell>{school.name}</TableCell>
										<TableCell>{directors}</TableCell>
										<TableCell>
											{(() => {
												if (school.ApplicationGrantedDelegationCountries.length) return <Badge color="green">Approved</Badge>;
												if (school.ApplicationDelegationPreferences.length)
													return (
														<Badge color="yellow">
															Received {school.ApplicationDelegationPreferences[0].date.toLocaleString("en-GB").slice(0, 17)}
														</Badge>
													);
												return <Badge color="red">Not Received</Badge>;
											})()}
										</TableCell>
										<TableCell>
											{(() => {
												if (school.finalDelegation.length) {
													const numberOfDelegates = school.finalDelegation[0].delegation.match(new RegExp("committeeId", "g")).length;
													return <Badge color="green">Approved ({numberOfDelegates} Delegates)</Badge>;
												}
												if (school.SchoolDelegationProposal.length) {
													const selectedDelegation = school.SchoolDelegationProposal[0].changes
														? school.SchoolDelegationProposal[0].changes
														: school.SchoolDelegationProposal[0].assignment;
													const numberOfDelegates = selectedDelegation.match(new RegExp("committeeId", "g")).length;
													return (
														<Badge color={school.SchoolDelegationProposal[0].changes ? "blue" : "yellow"}>
															Received {school.SchoolDelegationProposal[0].date.toLocaleString("en-GB").slice(0, 17)}
															{school.SchoolDelegationProposal[0].changes && " & Modified"} ({numberOfDelegates} Delegates)
														</Badge>
													);
												}
												return <Badge color="red">Not Received</Badge>;
											})()}
										</TableCell>
										<TableCell>
											{(() => {
												if (school.finalDelegation.length) return <Badge color="green">Invoice Generated</Badge>;
												return <Badge color="red">Not Made</Badge>;
											})()}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
				<Paginator itemsOnPage={schools.length} itemsPerPage={itemsPerPage} totalItems={numberOfSchools} />
			</MainWrapper>
		</>
	);
}
