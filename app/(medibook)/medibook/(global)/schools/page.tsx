import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { countries } from "@/data/countries";
import { OptionsDropdown } from "./client-components";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";

import Paginator from "@/components/pagination";
import { Link } from "@/components/link";
import { parseOrderDirection } from "@/lib/orderDirection";
import { Badge } from "@/components/badge";
import { Fragment } from "react";

const itemsPerPage = 10;

const rows = [
	<span key="actions" className="sr-only">
		Actions
	</span>,
	"Name",
	"Country",
	"Short Name",
	"Visibility",
	"Current Directors",
	"Number of Students",
	"Number of New Students",
	"Phone",
	"Email",
	"Website",
	"Year Joined",
];

const sortOptions = [
	{ value: "name", order: "asc", label: "Name" },
	{ value: "name", order: "desc", label: "Name" },
	{ value: "slug", order: "asc", label: "Short Name" },
	{ value: "slug", order: "desc", label: "Short Name" },
	{ value: "joinYear", order: "asc", label: "Year Joined" },
	{ value: "joinYear", order: "desc", label: "Year Joined" },
];

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const currentPage = parseInt(searchParams.page) || 1;
	const query = searchParams.search || "";
	const authSession = await auth();
	const orderBy = searchParams.order || "name";
	const queryObject = { where: { name: { contains: query, mode: "insensitive" } } };
	const orderDirection = parseOrderDirection(searchParams.direction);

	const [schools, unafilliatedCount, numberOfSchools] = await prisma
		.$transaction([
			prisma.school.findMany({
				...(queryObject as any),
				orderBy: { [orderBy]: orderDirection },
				include: {
					location: true,
					director: { where: { session: { isCurrent: true } }, select: { user: true } },
					_count: {
						select: {
							User: true,
						},
					},
				},
				take: itemsPerPage,
				skip: (currentPage - 1) * itemsPerPage,
			}),
			prisma.school.findMany({
				...(queryObject as any),
				orderBy: { [orderBy]: orderDirection },
				select: {
					_count: {
						select: {
							User: {
								where: {
									OR: [
										{
											schoolDirector: { none: {} },
											delegate: { none: {} },
											chair: { none: {} },
											member: { none: {} },
											manager: { none: {} },
											deputyPresidentOfTheGeneralAssembly: { none: {} },
											presidentOfTheGeneralAssembly: { none: {} },
											secretaryGeneral: { none: {} },
											deputySecretaryGeneral: { none: {} },
										},
										{
											schoolDirector: { some: { session: { isCurrent: true } } },
											delegate: { some: { committee: { session: { isCurrent: true } } } },
											chair: { some: { committee: { session: { isCurrent: true } } } },
											member: { some: { department: { session: { isCurrent: true } } } },
											manager: { some: { department: { session: { isCurrent: true } } } },
											deputyPresidentOfTheGeneralAssembly: { some: { session: { isCurrent: true } } },
											presidentOfTheGeneralAssembly: { some: { session: { isCurrent: true } } },
											secretaryGeneral: { some: { session: { isCurrent: true } } },
											deputySecretaryGeneral: { some: { session: { isCurrent: true } } },
										},
									],
								},
							},
						},
					},
				},
				take: itemsPerPage,
				skip: (currentPage - 1) * itemsPerPage,
			}),
			prisma.school.count(queryObject as any),
		])
		.catch((e) => console.log(e));

	return (
		<>
			<TopBar
				buttonHref="/medibook"
				buttonText="Home"
				subheading={`${numberOfSchools} Schools`}
				sortOptions={sortOptions}
				title="Schools"
				defaultSort="nameasc"
				searchText="Search schools...">
				{authorize(authSession, [s.management]) && <SearchParamsButton searchParams={{ "add-school": true }}>Add School</SearchParamsButton>}
			</TopBar>
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
							const country = countries.find((country) => country.countryCode === school?.location?.country);
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
										<OptionsDropdown school={school} />
									</TableCell>
									<TableCell>{school.name}</TableCell>
									<TableCell>{country?.countryNameEn || "-"}</TableCell>
									<TableCell>{school.slug || "-"}</TableCell>
									<TableCell>{school.isPublic ? <Badge color="green">Public</Badge> : <Badge color="red">Private</Badge>}</TableCell>
									<TableCell>{directors}</TableCell>
									<TableCell>{school._count.User || "None"}</TableCell>
									<TableCell>{unafilliatedCount[index]._count.User || "None"}</TableCell>
									<TableCell>{school.phone || "-"}</TableCell>
									<TableCell>{school.email || "-"}</TableCell>
									<TableCell>{school.website || "-"}</TableCell>
									<TableCell>{school.joinYear || "-"}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}
			<Paginator itemsOnPage={schools.length} itemsPerPage={itemsPerPage} totalItems={numberOfSchools} />
		</>
	);
}
