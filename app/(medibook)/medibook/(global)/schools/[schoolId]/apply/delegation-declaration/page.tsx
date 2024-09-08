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
import { InformationCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { areDelegateApplicationsOpen } from "@/app/(medibook)/medibook/(sessionSpecific)/sessions/[sessionNumber]/applications/delegation-declaration/page";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";

export default async function Page({ params }) {
	const authSession = await auth();
	const selectedSchool = await prisma.school.findFirst({ where: { OR: [{ id: params.schoolId }, { slug: params.schoolId }] } });
	const selectedSession = await prisma.session.findFirst({ where: { isCurrent: true }, include: { committee: true } });

	const isAuthorized = authorizeSchoolDirectorSchool(authSession.user.currentRoles, selectedSchool.id);

	if (!isAuthorized) notFound();

	const selectedSchoolHasApplication = await prisma.delegationDeclaration.findFirst({
		where: {
			session: {
				isCurrent: true,
			},
			schoolId: selectedSchool.id,
		},
	});

	console.log(selectedSchoolHasApplication);

	const numberOfGACommittees = selectedSession.committee.filter((committee) => committee.type === "GENERALASSEMBLY").length;
	const filteredCountries = countries.filter((country) => selectedSession.countriesOfSession.includes(country.countryCode));
	const applicationsOpen = areDelegateApplicationsOpen(selectedSession);
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
			/>
			<div className="flex flex-col gap-4 pt-4">
				{!applicationsOpen && !selectedSchoolHasApplication && (
					<div className="rounded-md bg-red-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">Applications are currently closed.</h3>
							</div>
						</div>
					</div>
				)}
				{selectedSchoolHasApplication && (
					<div className="rounded-md bg-zinc-50 px-4">
						<DescriptionList>
							<DescriptionTerm>Application ID</DescriptionTerm>
							<DescriptionDetails>{selectedSchoolHasApplication.id}</DescriptionDetails>
							<DescriptionTerm>Number of GA Delegations Requested</DescriptionTerm>
							<DescriptionDetails>{selectedSchoolHasApplication.numberOfGACountries}</DescriptionDetails>
							<DescriptionTerm>Preferred Countries</DescriptionTerm>
							<DescriptionDetails>
								{selectedSchoolHasApplication.countyPreferences.map((country) => {
									const selectedCountry = countries.find((c) => c.countryCode === country);
									return (
										<Text key={country}>
											{selectedCountry?.flag} {selectedCountry?.countryNameEn}
										</Text>
									);
								})}
							</DescriptionDetails>
							<DescriptionTerm>Application Status</DescriptionTerm>
							<DescriptionDetails>
								<Badge color="yellow">Submitted & Pending</Badge>
							</DescriptionDetails>
						</DescriptionList>
					</div>
				)}
				{!selectedSchoolHasApplication && (
					<div className="rounded-md bg-zinc-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-zinc-800">Important application details before you apply:</h3>
								<div className="mt-2 text-sm text-zinc-700">
									<ul role="list" className="list-disc space-y-1 pl-5">
										<li>Please fill out the form below to apply for a delegation. You can only apply once per session per school.</li>
										<li>
											You can&quot;t change your application once it has been submitted, so please make sure all the information is correct before you
											submit.
										</li>
										<li>
											The application fee for this session is {selectedSession.directorPrice}€ per school director and {selectedSession.delegatePrice}
											€ per delegate.
										</li>
										<li>
											If you have any questions or need help with your application, please contact us at{" "}
											<Link href="mailto:medimun.cyprus@gmail.com">medimun.cyprus@gmail.com</Link>.
										</li>
										<li>
											You can check the status of your application here, you will also receive an email once your application has been reviewed and
											you will have access to the next step.
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
			{!selectedSchoolHasApplication && applicationsOpen && (
				<>
					<Divider className="my-10" soft />
					<SelectCountriesSection
						selectedSchool={selectedSchool}
						filteredCountries={filteredCountries}
						selectedSession={selectedSession}
						numberOfGACommittees={numberOfGACommittees}
					/>
				</>
			)}
		</>
	);
}
