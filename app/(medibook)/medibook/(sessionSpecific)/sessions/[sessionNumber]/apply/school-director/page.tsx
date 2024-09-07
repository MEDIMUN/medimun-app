import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { Dropdown, DropdownButton, DropdownDescription, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import { Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import Paginator from "@/components/pagination";
import { Select } from "@/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Text } from "@/components/text";
import { authorize, s } from "@/lib/authorize";
import { parseOrderDirection } from "@/lib/orderDirection";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { EllipsisVerticalIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { notFound } from "next/navigation";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { areSchoolDirectorApplicationsOpen } from "../../applications/school-director/page";
import { ApplySchoolDirectorForm } from "./client-components";

const itemsPerPage = 10;

export default async function SchoolDirectorApplicationsPage({ params, searchParams }: { params: { sessionNumber: string }; searchParams: any }) {
	const authSession = await auth();

	const selectedSession = await prisma.session.findFirst({ where: { number: params.sessionNumber } }).catch(notFound);

	const selectedUserHasApplication = await prisma.applicationSchoolDirector.findFirst({
		where: {
			userId: authSession.user.id,
			sessionId: selectedSession.id,
		},
		include: {
			user: true,
			school: true,
		},
	});

	const userIsSchoolDirectorInSession = await prisma.schoolDirector.findFirst({
		where: {
			userId: authSession.user.id,
			sessionId: selectedSession.id,
		},
	});

	if (userIsSchoolDirectorInSession) {
		return notFound();
	}

	const schools = await prisma.school.findMany({
		where: {
			/* 			isPublic: true,
			 */ name: {
				not: {
					equals: "The English School",
				},
			},
		},
	});

	const selectedUser = await prisma.user.findFirst({
		where: {
			id: authSession.user.id,
		},
	});

	if (!selectedUser) return notFound();

	const applicationsOpen = areSchoolDirectorApplicationsOpen(selectedSession);

	return (
		<>
			<TopBar
				hideSearchBar
				buttonText={`Session ${romanize(parseInt(params.sessionNumber))}`}
				buttonHref={`/medibook/sessions/${params.sessionNumber}`}
				title="School Director Application"
			/>
			<div className="flex flex-col gap-4 pt-4">
				{!applicationsOpen && !selectedUserHasApplication && (
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
				{selectedUserHasApplication && (
					<div className="rounded-md bg-zinc-50 px-4">
						<DescriptionList>
							<DescriptionTerm>Application ID</DescriptionTerm>
							<DescriptionDetails>{selectedUserHasApplication.id}</DescriptionDetails>

							<DescriptionTerm>Application Date</DescriptionTerm>
							<DescriptionDetails>{selectedUserHasApplication.date.toLocaleString("uk").replace(",", " at ")}</DescriptionDetails>

							<DescriptionTerm>School Name</DescriptionTerm>
							<DescriptionDetails>{selectedUserHasApplication.school.name}</DescriptionDetails>

							<DescriptionTerm>School Email</DescriptionTerm>
							<DescriptionDetails>{selectedUserHasApplication.school.email || "-"}</DescriptionDetails>

							<DescriptionTerm>Applicant Name</DescriptionTerm>
							<DescriptionDetails>{`${selectedUserHasApplication.user.officialName} ${selectedUserHasApplication.user.officialSurname}`}</DescriptionDetails>

							<DescriptionTerm>Applicant Phone Number</DescriptionTerm>
							<DescriptionDetails>{selectedUserHasApplication.user.phoneNumber || "-"}</DescriptionDetails>

							<DescriptionTerm>Applicant Email</DescriptionTerm>
							<DescriptionDetails>{selectedUserHasApplication.user.email}</DescriptionDetails>

							<DescriptionTerm>Application Status</DescriptionTerm>
							<DescriptionDetails>
								{selectedUserHasApplication.isApproved ? <Badge color="green">Approved</Badge> : <Badge color="yellow">Pending</Badge>}
							</DescriptionDetails>
						</DescriptionList>
					</div>
				)}
				{!selectedUserHasApplication && (
					<div className="rounded-md bg-zinc-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-zinc-800">Important application details before you apply:</h3>
								<div className="mt-2 text-sm text-zinc-700">
									<ul role="list" className="list-disc space-y-1 pl-5">
										<li>Each School Director must complete a separate application even if you represent the same school.</li>
										<li>All applications are subject to approval by the Senior Directors.</li>
										<li>You may apply for only one school per session.</li>
										<li>
											We may contact your school to verify your affiliation especially in cases where you were previously not the school director of
											the school you are applying for.
										</li>
										<li>
											The application fee for this session is {selectedSession.directorPrice}€ per school director and {selectedSession.delegatePrice}
											€ per delegate.
										</li>
										<li>
											If your school is not listed, or if this is your first year attending, please reach out to us at{" "}
											<Link href="mailto:medimun.cyprus@gmail.com">medimun.cyprus@gmail.com</Link> to have your school added to the system.
										</li>
										<li>You can check the status of your application here, you willalso receive an email once your application has been reviewed.</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				)}
				{applicationsOpen && !selectedUserHasApplication?.isApproved && (
					<div className="rounded-md bg-zinc-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-zinc-800">After your application gets approved:</h3>
								<div className="mt-2 text-sm text-zinc-700">
									<ul role="list" className="list-disc space-y-1 pl-5">
										<li>You will be able to access the delegate application process.</li>
										<li>
											You will be able to view and manage all students affiliated with your school in the School Management section of MediBook.
										</li>
										<li>You will be able to view past and current delegate certificates.</li>
										<li>You will be able to view the performance of delegates during the conference debates.</li>
										<li>View if your students are present or absent during the conference.</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				)}
				{selectedSession.isCurrent && selectedUserHasApplication?.isApproved && (
					<div className="rounded-md bg-zinc-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-zinc-800">Your application has been approved. You can now:</h3>
								<div className="mt-2 text-sm text-zinc-700">
									<ul role="list" className="list-disc space-y-1 pl-5">
										<li>Access the delegate application process.</li>
										<li>View and manage all students affiliated with your school in the School Management section of MediBook.</li>
										<li>View past and current delegate certificates.</li>
										<li>View the performance of delegates during the conference debates.</li>
										<li>View if your students are present or absent during the conference.</li>
										<li>Check out the sidebar to find the school management section where you can manage your school&apos;s delegates.</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				)}
				{!selectedUser.phoneNumber && !selectedUserHasApplication && (
					<div className="rounded-md bg-red-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">
									Your must have a phone number added to your account to apply as a school director. Check out the{" "}
									<Link className="underline hover:no-underline" href={"/medibook/account"}>
										Account Settings
									</Link>{" "}
									section.
								</h3>
							</div>
						</div>
					</div>
				)}
				{!selectedUser.bestTimeToReach && !selectedUserHasApplication && (
					<div className="rounded-md bg-red-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">
									You must add the &quot;Best Time To Reach You&quot; option to your account to apply as a school director. Check out the{" "}
									<Link className="underline hover:no-underline" href={"/medibook/account"}>
										Account Settings
									</Link>{" "}
									section.
								</h3>
							</div>
						</div>
					</div>
				)}
			</div>
			{selectedUser.phoneNumber && selectedUser.bestTimeToReach && applicationsOpen && !selectedUserHasApplication && (
				<ApplySchoolDirectorForm selectedSession={selectedSession} schools={schools} />
			)}
		</>
	);
}
