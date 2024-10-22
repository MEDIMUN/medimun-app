import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { countries } from "@/data/countries";
import { OptionsDropdown } from "./client-components";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";

import Paginator from "@/components/pagination";
import { parseOrderDirection } from "@/lib/orderDirection";

const locationsPerPage = 10;

const rows = [
	<span key="actions" className="sr-only">
		Actions
	</span>,
	"Name",
	"Country",
	"Short Name",
	"Linked Schools",
	"Phone",
	"Email",
	"Website",
];

const sortOptions = [
	{ value: "name", order: "asc", label: "Name" },
	{ value: "name", order: "desc", label: "Name" },
	{ value: "slug", order: "asc", label: "Short Name" },
	{ value: "slug", order: "desc", label: "Short Name" },
	{ value: "country", order: "asc", label: "Country" },
	{ value: "country", order: "desc", label: "Country" },
];

export default async function Page({ searchParams }) {
	const currentPage = parseInt(searchParams.page) || 1;
	const query = searchParams.search || "";
	const authSession = await auth();
	if (!authSession) notFound();
	const orderBy = searchParams.order || "name";
	const queryObject = { where: { name: { contains: query, mode: "insensitive" } } };
	const orderDirection = parseOrderDirection(searchParams.direction);

	const [locations, numberOfSchools] = await prisma
		.$transaction([
			prisma.location.findMany({
				...(queryObject as any),
				orderBy: { [orderBy]: orderDirection },
				include: { school: true },
				take: locationsPerPage,
				skip: (currentPage - 1) * locationsPerPage,
			}),
			prisma.location.count(queryObject as any),
		])
		.catch(notFound);

	return (
		<>
			<TopBar
				buttonHref="/medibook"
				buttonText="Home"
				subheading={`${numberOfSchools} Locations`}
				sortOptions={sortOptions}
				title="Locations"
				defaultSort="nameasc"
				searchText="Search locations...">
				{authorize(authSession, [s.management]) && (
					<SearchParamsButton searchParams={{ "create-location": true }}>Create Location</SearchParamsButton>
				)}
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
						{locations.map((location) => {
							const country = countries.find((country) => country.countryCode === location.country);
							const others = `${location?.school[0]?.name} ${
								location?.school?.length > 1 && ` + ${location?.school.length - 1} other${location?.school.length > 2 ? "s" : ""}`
							}`;
							return (
								<TableRow href={`/medibook/locations/${location.slug || location.id}`} key={location.id}>
									<TableCell>
										<OptionsDropdown location={location} />
									</TableCell>
									<TableCell>{location.name}</TableCell>
									<TableCell>{country?.countryNameEn || "-"}</TableCell>
									<TableCell>{location.slug || "-"}</TableCell>
									<TableCell>{!!location?.school.length ? others : "-"}</TableCell>
									<TableCell>{location.phone || "-"}</TableCell>
									<TableCell>{location.email || "-"}</TableCell>
									<TableCell>{location.website || "-"}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}
			<Paginator itemsOnPage={locations.length} itemsPerPage={locationsPerPage} totalItems={numberOfSchools} />
		</>
	);
}
