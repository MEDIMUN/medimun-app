import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { XCircleIcon } from "@heroicons/react/16/solid";
import { notFound } from "next/navigation";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { areSchoolDirectorApplicationsOpen } from "../../applications/school-director/page";
import { ApplySchoolDirectorForm } from "./client-components";
import { Code, Strong, Text, TextLink } from "@/components/text";
import { Divider } from "@/components/divider";

export default async function SchoolDirectorApplicationsPage({ params }: { params: { sessionNumber: string }; searchParams: any }) {
	const authSession = await auth();

	const [selectedSession, selectedUserHasApplication, userIsSchoolDirectorInSession, schools, selectedUser] = await Promise.all([
		prisma.session.findFirstOrThrow({ where: { number: params.sessionNumber } }).catch(notFound),
		prisma.applicationSchoolDirector.findFirst({
			where: { userId: authSession.user.id, sessionId: params.sessionNumber },
			include: { user: true, school: true },
		}),
		prisma.schoolDirector.findFirst({
			where: { userId: authSession.user.id, session: { number: params.sessionNumber } },
		}),
		prisma.school.findMany({
			where: { isPublic: true, name: { not: { equals: "The English School" } } },
		}),
		prisma.user
			.findFirstOrThrow({
				where: { id: authSession.user.id },
			})
			.catch(notFound),
	]);

	if (userIsSchoolDirectorInSession) notFound();

	const applicationsOpen = areSchoolDirectorApplicationsOpen(selectedSession);

	return (
		<>
			<TopBar
				hideSearchBar
				buttonText={`Session ${romanize(parseInt(params.sessionNumber))}`}
				buttonHref={`/medibook/sessions/${params.sessionNumber}`}
				title="School Director Application"
			/>
			<div className="flex flex-col gap-4">
				{!applicationsOpen && !selectedUserHasApplication && (
					<div className="rounded-md bg-zinc-100 p-4">
						<div className="flex">
							<div className="flex flex-shrink-0">
								<XCircleIcon aria-hidden="true" className="my-auto h-5 w-5 text-zinc-400" />
							</div>
							<Text className="ml-3">Applications are currently closed.</Text>
						</div>
					</div>
				)}
				{!selectedUser.phoneNumber && !selectedUserHasApplication && (
					<div className="rounded-md bg-zinc-100 p-4">
						<div className="flex">
							<div className="flex flex-shrink-0">
								<XCircleIcon aria-hidden="true" className="my-auto h-5 w-5 text-zinc-400" />
							</div>
							<Text className="ml-3">
								Your must have a phone number added to your account to apply as a school director. Check out the{" "}
								<TextLink href={"/medibook/account"}>Account Settings</TextLink> section.
							</Text>
						</div>
					</div>
				)}
				{!selectedUser.bestTimeToReach && !selectedUserHasApplication && (
					<div className="rounded-md bg-zinc-100 p-4">
						<div className="flex">
							<div className="flex flex-shrink-0">
								<XCircleIcon aria-hidden="true" className="my-auto h-5 w-5 text-zinc-400" />
							</div>
							<Text className="ml-3">
								You must add the <Strong>Best Time To Reach You</Strong> option to your account to apply as a school director. Check out the{" "}
								<TextLink href={"/medibook/account"}>Account Settings</TextLink> section.
							</Text>
						</div>
					</div>
				)}
				{selectedUserHasApplication && (
					<div className="rounded-md bg-zinc-100 px-4">
						<DescriptionList>
							<DescriptionTerm>Application ID</DescriptionTerm>
							<DescriptionDetails>{selectedUserHasApplication.id}</DescriptionDetails>
							<DescriptionTerm>Application Status</DescriptionTerm>
							<DescriptionDetails>
								{selectedUserHasApplication.isApproved ? <Badge color="green">Approved</Badge> : <Badge color="yellow">Submitted & Pending</Badge>}
							</DescriptionDetails>
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
						</DescriptionList>
					</div>
				)}
				{!selectedUserHasApplication && (
					<div className="rounded-md bg-zinc-100 p-4">
						<div className="flex flex-col">
							<Text>
								<Strong>Important application details before you apply:</Strong>
							</Text>
							<Divider className="my-2" />
							<ul className="ml-4 list-disc">
								<Text as="li">Each School Director must complete a separate application even if you represent the same school.</Text>
								<Text as="li">We may contact your school to verify your affiliation.</Text>
								<Text as="li">
									The application fee for this session is <Code>{selectedSession.directorPrice}€</Code> per school director and{" "}
									<Code>{selectedSession.delegatePrice}€</Code> per delegate.
								</Text>
								<Text as="li">
									If your school is not listed please reach out to us at{" "}
									<TextLink href="mailto:medimun.cyprus@gmail.com">medimun.cyprus@gmail.com</TextLink> to have your school added to the system.
								</Text>
								<Text as="li">
									You can check the status of your application here, you willalso receive an email once your application has been reviewed.
								</Text>
							</ul>
						</div>
					</div>
				)}
				{applicationsOpen && !selectedUserHasApplication?.isApproved && (
					<div className="rounded-md bg-zinc-100 p-4">
						<div className="flex flex-col">
							<Text>
								<Strong>After your application gets approved, You will be able to:</Strong>
							</Text>
							<Divider className="my-2" />
							<ul className="ml-4 list-disc">
								<Text as="li">Access the delegation application process.</Text>
								<Text as="li">View and manage all students affiliated with your school.</Text>
								<Text as="li">View past and current delegate certificates.</Text>
								<Text as="li">View the performance of delegates during the conference debates.</Text>
								<Text as="li">View delegation&apos;s attendance during the conference.</Text>
							</ul>
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
