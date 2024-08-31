import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { countries } from "@/data/countries";
import { OptionsDropdown } from "./client-components";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";

import Paginator from "@/components/Paginator";
import { parseOrderDirection } from "@/lib/orderDirection";
import { Search } from "lucide-react";

const locationsPerPage = 10;

const rows = [<span className="sr-only">Actions</span>, "Name", "Country", "Short Name", "Linked Schools", "Phone", "Email", "Website"];

const sortOptions = [
	{ value: "name", order: "asc", label: "Name", description: "Ascending" },
	{ value: "name", order: "desc", label: "Name", description: "Descending" },
	{ value: "slug", order: "asc", label: "Short Name", description: "Ascending" },
	{ value: "slug", order: "desc", label: "Short Name", description: "Descending" },
	{ value: "country", order: "asc", label: "Country", description: "Ascending" },
	{ value: "country", order: "desc", label: "Country", description: "Descending" },
];

export default async function Page({ searchParams }) {
	const currentPage = parseInt(searchParams.page) || 1;
	const query = searchParams.search || "";
	const authSession = await auth();
	const orderBy = searchParams.order || "name";
	const queryObject = { where: { name: { contains: query, mode: "insensitive" } } };
	const orderDirection = parseOrderDirection(searchParams.direction);

	const numberOfSchoolsPromise = prisma.location.count(queryObject as any).catch();
	const locationsPromise = prisma.location
		.findMany({
			...(queryObject as any),
			orderBy: { [orderBy]: orderDirection },
			include: { school: true },
			take: locationsPerPage,
			skip: (currentPage - 1) * locationsPerPage,
		})
		.catch(notFound);

	const [locations, numberOfSchools] = await Promise.all([locationsPromise, numberOfSchoolsPromise]);

	return (
		<>
			<TopBar sortOptions={sortOptions} title="Locations" defaultSort="nameasc" searchText="Search locations...">
				{authorize(authSession, [s.management]) && (
					<SearchParamsButton searchParams={{ "create-location": true }}>Create Location</SearchParamsButton>
				)}
			</TopBar>
			{!!numberOfSchools ? (
				<Table className="showscrollbar mt-10">
					<TableHead>
						<TableRow>
							{rows.map((row, i) => (
								<TableHeader key={i}>{row}</TableHeader>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{locations.map(
							(location: {
								id: string;
								name: string;
								slug: string;
								isPublic: boolean;
								street: string;
								city: string;
								state: string;
								zipCode: string;
								country: string;
								cover: string;
								phone: string;
								email: string;
								website: string;
								school: { name: string }[];
							}) => {
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
							}
						)}
					</TableBody>
				</Table>
			) : (
				<div className="my-10 text-center">
					<h3 className="mt-2 text-sm font-semibold text-gray-900">No locations</h3>
					<p className="mt-1 text-sm text-gray-500">Get started by adding a new location.</p>
				</div>
			)}
			<Paginator itemsPerPage={locationsPerPage} totalItems={numberOfSchools} />
		</>
	);
}
