import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { Divider } from "@/components/divider";
import { Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Select } from "@/components/select";
import { Text } from "@/components/text";
import { countries } from "@/data/countries";
import { arrayFromNumber } from "@/lib/arrayFromNumber";
import { authorizeSchoolDirectorSchool } from "@/lib/authorize";
import { getOrdinal } from "@/lib/ordinal";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { SelectCountriesSection } from "./client-components";

export default async function Page({ params }) {
	const authSession = await auth();
	const selectedSchool = await prisma.school.findFirst({ where: { OR: [{ id: params.schoolId }, { slug: params.schoolId }] } });
	const selectedSession = await prisma.session.findFirst({ where: { isCurrent: true }, include: { committee: true } });

	const isAuthorized = authorizeSchoolDirectorSchool(authSession.currentRoles, selectedSchool.id);

	/* 	if (!isAuthorized) notFound();
	 */

	const numberOfGACommittees = selectedSession.committee.filter((committee) => committee.type === "GENERALASSEMBLY").length;
	const filteredCountries = countries.filter((country) => selectedSession.countriesOfSession.includes(country.countryCode));

	return (
		<>
			<TopBar
				buttonText={selectedSchool.name}
				buttonHref={`/medibook/schools/${selectedSchool.slug || selectedSchool.id}`}
				hideSearchBar
				title={
					<>
						Delegation Declaration
						<Badge className="ml-2 -translate-y-[2px]" color="red">
							Stage 1
						</Badge>
					</>
				}
				subheading="Fill out the form below to apply for a delegation."
			/>
			<Divider className="my-10" soft />
			<SelectCountriesSection
				selectedSchool={selectedSchool}
				filteredCountries={filteredCountries}
				selectedSession={selectedSession}
				numberOfGACommittees={numberOfGACommittees}
			/>
		</>
	);
}
