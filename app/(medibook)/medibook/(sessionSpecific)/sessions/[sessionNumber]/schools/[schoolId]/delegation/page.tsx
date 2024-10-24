import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { Divider } from "@/components/divider";
import { Text } from "@/components/text";
import { countries } from "@/data/countries";
import { authorizeSchoolDirectorSchool } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { SelectCountriesSection, SelectStudents } from "./client-components";
import { InformationCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { areDelegateApplicationsOpen } from "@/app/(medibook)/medibook/(sessionSpecific)/sessions/[sessionNumber]/applications/delegation/page";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Avatar } from "@nextui-org/avatar";

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const authSession = await auth();
	const selectedSchool = await prisma.school.findFirst({ where: { OR: [{ id: params.schoolId }, { slug: params.schoolId }] } });
	const selectedSession = await prisma.session
		.findFirstOrThrow({
			where: { number: params.sessionNumber },
			include: { committee: { include: { ExtraCountry: true } } },
		})
		.catch(notFound);
	const grantedDelegation = await prisma.applicationGrantedDelegationCountries.findFirst({
		where: { sessionId: selectedSession.id, schoolId: selectedSchool.id },
	});
	const query = searchParams.search || "";
	const isAuthorized = authorizeSchoolDirectorSchool(authSession.user.currentRoles, selectedSchool.id);

	if (!isAuthorized || !selectedSession) notFound();

	const selectedSchoolHasApplication = await prisma.applicationDelegationPreferences.findFirst({
		where: { session: { number: params.sessionNumber }, schoolId: selectedSchool.id },
	});
	const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
	const schoolStudents = await prisma.user.findMany({
		where: {
			schoolId: selectedSchool.id,
			OR: [
				{ officialName: { contains: query, mode: "insensitive" } },
				{ officialSurname: { contains: query, mode: "insensitive" } },
				{ displayName: { contains: query, mode: "insensitive" } },
				{ email: { contains: query, mode: "insensitive" } },
				{ id: { contains: query, mode: "insensitive" } },
			],
		},
		orderBy: [{ officialName: "asc" }, { officialSurname: "asc" }, { displayName: "asc" }],
		take: 10,
		skip: (currentPage - 1) * 10,
	});

	const numberOfStudents = await prisma.user.count({
		where: { schoolId: selectedSchool.id, officialName: { contains: query } },
	});

	const delegationAssignmentProposal = await prisma.schoolDelegationProposal.findFirst({
		where: { schoolId: selectedSchool.id, sessionId: selectedSession.id },
		include: { school: { include: { finalDelegation: true } } },
	});

	const numberOfGACommittees = selectedSession.committee.filter((committee) => committee.type === "GENERALASSEMBLY").length;
	const filteredCountries = countries.filter((country) => selectedSession.countriesOfSession.includes(country.countryCode));
	const applicationsOpen = areDelegateApplicationsOpen(selectedSession);

	const parsedAssignment = delegationAssignmentProposal
		? JSON.parse(delegationAssignmentProposal.assignment).sort((a, b) => {
				const committeeA = selectedSession.committee.find((committee) => committee.id === a.committeeId);
				const committeeB = selectedSession.committee.find((committee) => committee.id === b.committeeId);
				if (committeeA.name !== committeeB.name) return committeeA.name.localeCompare(committeeB.name);
				if (committeeA.type !== committeeB.type) return committeeA.type.localeCompare(committeeB.type);
				return a.countryCode.localeCompare(b.countryCode);
			})
		: null;

	const userIds = parsedAssignment?.map((assignment) => assignment.studentId);

	const users = parsedAssignment ? await prisma.user.findMany({ where: { id: { in: parsedAssignment.map((a) => a.studentId) } } }) : [];

	const renderAssignments = (assignments) =>
		assignments.map((assignment) => {
			const student = users.find((u) => u.id === assignment.studentId);
			const committee = selectedSession.committee.find((c) => c.id === assignment.committeeId);
			const country = countries.find((c) => c.countryCode === assignment.countryCode);
			return (
				<>
					<DescriptionTerm className="space-x-2">
						<Badge>{committee.name}</Badge>
						{country && (
							<Badge>
								{country.flag} {country.countryNameEn}
							</Badge>
						)}
					</DescriptionTerm>
					<DescriptionDetails>
						{student?.id ? (
							<Badge className="!p-0" color="">
								<Avatar showFallback className="h-4 w-4 bg-primary text-white" src={`/api/users/${student.id}/avatar`} />
								{student.displayName || `${student.officialName} ${student.officialSurname}`}
							</Badge>
						) : (
							<Badge color="red">Deleted User</Badge>
						)}
					</DescriptionDetails>
				</>
			);
		});

	if (delegationAssignmentProposal?.school?.finalDelegation?.length) {
		const proposal = delegationAssignmentProposal;
		return (
			<>
				<TopBar
					buttonText={selectedSchool.name}
					buttonHref={`/medibook/schools/${selectedSchool.slug || selectedSchool.id}`}
					hideSearchBar
					title="My Delegation"
				/>
				<DescriptionList>
					<DescriptionTerm>Delegation ID</DescriptionTerm>
					<DescriptionDetails>{proposal.school.finalDelegation[0].id}</DescriptionDetails>
					<DescriptionTerm>Delegation Application Status</DescriptionTerm>
					<DescriptionDetails>
						<Badge color="green">Accepted</Badge>
					</DescriptionDetails>
					<DescriptionTerm>Assignments</DescriptionTerm>
					<DescriptionDetails>
						<DescriptionList>{renderAssignments(JSON.parse(proposal.school.finalDelegation[0].delegation))}</DescriptionList>
					</DescriptionDetails>
				</DescriptionList>
			</>
		);
	}

	if (delegationAssignmentProposal) {
		return (
			<>
				<TopBar
					buttonText={selectedSchool.name}
					buttonHref={`/medibook/schools/${selectedSchool.slug || selectedSchool.id}`}
					hideSearchBar
					title="Delegation Assignment"
				/>
				<DescriptionList>
					<DescriptionTerm>Application ID</DescriptionTerm>
					<DescriptionDetails>{delegationAssignmentProposal.id}</DescriptionDetails>
					<DescriptionTerm>Application Status</DescriptionTerm>
					<DescriptionDetails>
						<Badge color="yellow">Pending</Badge>
					</DescriptionDetails>
					<DescriptionTerm>Student Assignment Proposal</DescriptionTerm>
					<DescriptionDetails>
						<DescriptionList>{renderAssignments(parsedAssignment)}</DescriptionList>
					</DescriptionDetails>
				</DescriptionList>
			</>
		);
	}

	if (!applicationsOpen && !selectedSchoolHasApplication) {
		return (
			<>
				<TopBar
					buttonText={selectedSchool.name}
					buttonHref={`/medibook/schools/${selectedSchool.slug || selectedSchool.id}`}
					hideSearchBar
					title="Delegation Application"
				/>
				<div className="mt-4 rounded-md bg-red-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">Applications are currently closed.</h3>
						</div>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<TopBar
				buttonText={selectedSchool.name}
				buttonHref={`/medibook/schools/${selectedSchool.slug || selectedSchool.id}`}
				hideSearchBar
				title="Delegation Application"
			/>
			<div className="flex flex-col gap-4">
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
				{selectedSchoolHasApplication && !grantedDelegation && (
					<div className="rounded-md bg-zinc-50 px-4">
						<DescriptionList>
							<DescriptionTerm>Application ID</DescriptionTerm>
							<DescriptionDetails>{selectedSchoolHasApplication.id}</DescriptionDetails>
							<DescriptionTerm>Number of GA Delegations Requested</DescriptionTerm>
							<DescriptionDetails>{selectedSchoolHasApplication.numberOfGACountries}</DescriptionDetails>
							<DescriptionTerm>Preferred Countries</DescriptionTerm>
							<DescriptionDetails className="flex flex-wrap gap-1">
								{selectedSchoolHasApplication.countyPreferences.map((country) => {
									const selectedCountry = countries.find((c) => c.countryCode === country);
									return (
										<Badge key={country}>
											{selectedCountry?.flag} {selectedCountry?.countryNameEn}
										</Badge>
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
				{grantedDelegation && (
					<div className="rounded-md bg-zinc-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-zinc-800">Your delegation application has been processed: </h3>
								<div className="mt-2 text-sm text-zinc-700">
									<ul role="list" className="list-disc space-y-1 pl-5">
										<li>
											The application fee for this session is {selectedSession.directorPrice}€ per school director and {selectedSession.delegatePrice}
											€ per delegate.
										</li>
										<li>
											If you have any questions or need assistance with your application, please contact us at{" "}
											<Link href="mailto:medimun.cyprus@gmail.com">medimun.cyprus@gmail.com</Link>.
										</li>
										<li>
											Select all students you will assign to GAs, Security Councils, and other committees below; you will assign the selected students
											in the next stage.
										</li>
										<li>
											To appear in the list below, students must have a MediBook account, select {selectedSchool.name} as their school in their
											account settings, provide a valid birthday, and be aged between {selectedSession.minimumDelegateAgeOnFirstConferenceDay} and{" "}
											{selectedSession.maximumDelegateAgeOnFirstConferenceDay} years old on the first day of the conference. For questions about our
											age policy or if a student who should be listed does not appear, please contact us at{" "}
											<Link href="mailto:medimun.cyprus@gmail.com">medimun.cyprus@gmail.com</Link>.
										</li>
										<li>
											Once you complete this stage of the application, our team will review and confirm your choices. Your delegates will receive
											their roles, and you will receive an invoice in the payments section under the School Management tab in the sidebar.
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				)}
				{grantedDelegation && (
					<div className="rounded-md bg-zinc-50 px-4">
						<DescriptionList>
							<DescriptionTerm>Delegation ID</DescriptionTerm>
							<DescriptionDetails className="font-mono">{grantedDelegation.id}</DescriptionDetails>
							<DescriptionTerm>Application Status</DescriptionTerm>
							<DescriptionDetails>
								<Badge color="green">Accepted</Badge>
							</DescriptionDetails>
							<DescriptionTerm>Number of GA Delegations</DescriptionTerm>
							<DescriptionDetails>{grantedDelegation.countries.filter((c) => c !== "NOTGRANTED").length}</DescriptionDetails>
							<DescriptionTerm>Assigned GA Countries</DescriptionTerm>
							<DescriptionDetails className="flex flex-wrap gap-1">
								{grantedDelegation.countries
									.filter((c) => c !== "NOTGRANTED")
									.map((country) => {
										const selectedCountry = countries.find((c) => c.countryCode === country);
										return (
											<Badge className="max-w-max" key={country}>
												{selectedCountry?.flag} {selectedCountry?.countryNameEn}
											</Badge>
										);
									})}
							</DescriptionDetails>
						</DescriptionList>
					</div>
				)}
				{selectedSchoolHasApplication && grantedDelegation && (
					<SelectStudents
						numberOfStudents={numberOfStudents}
						grantedDelegation={grantedDelegation}
						students={schoolStudents}
						selectedSession={selectedSession}
					/>
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
											You can&apos;t change your application once it has been submitted, so please make sure all the information is correct before you
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
											You can check the status of your application here, and you will also receive an email once your application has been reviewed
											and you will have access to the next step.
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
