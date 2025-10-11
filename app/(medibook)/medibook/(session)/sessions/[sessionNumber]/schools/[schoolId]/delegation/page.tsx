import { SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { Divider } from "@/components/divider";
import { Text } from "@/components/text";
import { countries } from "@/data/countries";
import { authorize, authorizeSchoolDirectorSchool, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { SelectCountriesSection, SelectStudents } from "./client-components";
import Link from "next/link";
import { areDelegateApplicationsOpen } from "@/app/(medibook)/medibook/(session)/sessions/[sessionNumber]/applications/delegation/page";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Avatar } from "@heroui/avatar";
import { Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { CircleX, Ellipsis, Info } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const authSession = await auth();
  if (!authSession) notFound();

  const selectedSession = await prisma.session
    .findFirstOrThrow({
      where: { number: params.sessionNumber },
      include: { committee: { include: { ExtraCountry: true } } },
    })
    .catch(notFound);

  const selectedSchool = await prisma.school
    .findFirstOrThrow({
      where: { OR: [{ id: params.schoolId }, { slug: params.schoolId }] },
      include: { finalDelegation: { where: { sessionId: selectedSession.id } } },
    })
    .catch(notFound);

  const grantedDelegation = await prisma.applicationGrantedDelegationCountries.findFirst({
    where: { sessionId: selectedSession.id, schoolId: selectedSchool.id },
  });
  const query = searchParams.search || "";
  const isManagement = authorize(authSession, [s.management]);
  const isAuthorized = isManagement || authorizeSchoolDirectorSchool(authSession.user.currentRoles, selectedSchool.id);

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
    skip: ((currentPage || 1) - 1) * 10,
    omit: { signature: true },
  });

  const numberOfStudents = await prisma.user.count({
    where: { schoolId: selectedSchool.id, officialName: { contains: query } },
  });

  const delegationAssignmentProposal = await prisma.schoolDelegationProposal.findFirst({
    where: { schoolId: selectedSchool.id, sessionId: selectedSession.id },
  });

  const numberOfGACommittees = selectedSession.committee.filter(
    (committee) => committee.type === "GENERALASSEMBLY",
  ).length;
  const filteredCountries = countries.filter((country) =>
    selectedSession.countriesOfSession.includes(country.countryCode),
  );
  const applicationsOpen = areDelegateApplicationsOpen(selectedSession);

  const parsedAssignment = delegationAssignmentProposal ? JSON.parse(delegationAssignmentProposal.assignment) : null;
  const parsedFinal = selectedSchool.finalDelegation[0]
    ? JSON.parse(selectedSchool.finalDelegation[0].delegation)
    : null;

  const userIds = parsedAssignment?.map((assignment) => assignment.studentId);
  const finalStudentIds = parsedFinal?.map((assignment) => assignment.studentId);

  const allStudentIds = [...(userIds || []), ...(finalStudentIds || [])];

  const users =
    parsedAssignment || parsedFinal
      ? await prisma.user.findMany({ where: { id: { in: allStudentIds } }, omit: { signature: true } })
      : [];

  const assignedDelegatesOfSchoolAndSession = await prisma.delegate.findMany({
    where: {
      committee: { sessionId: selectedSession.id },
      user: {
        schoolId: selectedSchool.id,
      },
    },
    orderBy: [
      { committee: { type: "asc" } },
      { committee: { name: "asc" } },
      { country: "asc" },
      { user: { officialName: "asc" } },
    ],
    select: {
      country: true,
      committee: {
        select: {
          slug: true,
          id: true,
          name: true,
          ExtraCountry: true,
        },
      },
      user: {
        select: {
          username: true,
          officialName: true,
          officialSurname: true,
          displayName: true,
          id: true,
        },
      },
    },
  });

  //map assignemnts in a way that we can use it in the renderAssignments function

  const renderAssignments = (assignments) =>
    assignments.map((assignment, index) => {
      const student = users.find((u) => u.id === assignment.studentId);
      const committee = selectedSession.committee.find((c) => c.id === assignment.committeeId);
      const country = countries.find((c) => c.countryCode === assignment.countryCode);
      if (!student || !committee) return <Text key={Math.random()}>Error: Student or Committee not found</Text>;
      return (
        <Fragment key={Math.random()}>
          <Badge color="" className="px-0!">
            {committee.name} {country && country.flag} {country && country.countryNameEn}
          </Badge>
          <Badge className="max-w-max">
            <Avatar showFallback className="h-4 w-4" src={`/api/users/${student.id}/avatar`} />
            {student.displayName || `${student.officialName} ${student.officialSurname}`}{" "}
            <span className="font-light">{student.id}</span>
          </Badge>
          {index !== assignments.length - 1 && <Divider soft className="col-span-1-1 xl:col-span-2" />}
        </Fragment>
      );
    });

  if (selectedSchool?.finalDelegation?.length || delegationAssignmentProposal?.status == "ACCEPTED") {
    return (
      <>
        <TopBar
          buttonText={selectedSchool.name}
          buttonHref={`/medibook/schools/${selectedSchool.slug || selectedSchool.id}`}
          title="My Delegation"
        />
        <MainWrapper>
          <Table className="showscrollbar">
            <TableHead>
              <TableRow>
                <TableHeader>
                  <span className="sr-only">Actions</span>
                </TableHeader>
                <TableHeader>Official Name</TableHeader>
                <TableHeader>Official Surname</TableHeader>
                <TableHeader>Display Name</TableHeader>
                <TableHeader>Committee</TableHeader>
                <TableHeader>Country/Entity</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedDelegatesOfSchoolAndSession.map((assignment, index) => {
                const user = assignment.user;
                const committee = assignment.committee;
                const allCountries = countries.concat(committee.ExtraCountry);
                const selectedCountry = allCountries.find((c) => c.countryCode === assignment.country);
                return (
                  <TableRow key={index + user.id}>
                    <TableCell>
                      <Dropdown>
                        <DropdownButton className="my-auto max-h-max" plain aria-label="More options">
                          <Ellipsis width={18} />
                        </DropdownButton>
                        <DropdownMenu anchor="bottom end">
                          <DropdownItem href={`/medibook/users/${user.username || user.id}`}>View User</DropdownItem>
                          <SearchParamsDropDropdownItem searchParams={{ "edit-user": user.id }}>
                            Edit User
                          </SearchParamsDropDropdownItem>
                          <DropdownItem href={`/medibook/committees/${committee.slug || committee.id}`}>
                            View Committee
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                    <TableCell>{user.officialName}</TableCell>
                    <TableCell>{user.officialSurname}</TableCell>
                    <TableCell>{user.displayName || "-"}</TableCell>
                    <TableCell>{committee.name}</TableCell>
                    <TableCell>{selectedCountry?.countryNameEn}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </MainWrapper>
      </>
    );
  }

  if (delegationAssignmentProposal) {
    return (
      <>
        <TopBar
          hideBackdrop
          buttonText={selectedSchool.name}
          buttonHref={`/medibook/schools/${selectedSchool.slug || selectedSchool.id}`}
          hideSearchBar
          title="Delegation Assignment"
        />
        <MainWrapper>
          <DescriptionList>
            <DescriptionTerm>Application ID</DescriptionTerm>
            <DescriptionDetails>{delegationAssignmentProposal.id}</DescriptionDetails>
            <DescriptionTerm>Application Status</DescriptionTerm>
            <DescriptionDetails>
              <Badge color="yellow">Pending</Badge>
            </DescriptionDetails>
            <DescriptionTerm>Student Assignment Proposal</DescriptionTerm>
            <DescriptionDetails>
              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">{renderAssignments(parsedAssignment)}</div>
            </DescriptionDetails>
          </DescriptionList>
        </MainWrapper>
      </>
    );
  }

  if (!applicationsOpen && !selectedSchoolHasApplication) {
    return (
      <>
        <TopBar
          hideBackdrop
          buttonText={selectedSchool.name}
          buttonHref={`/medibook/schools/${selectedSchool.slug || selectedSchool.id}`}
          hideSearchBar
          title="Delegation Application"
        />
        <MainWrapper>
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <CircleX aria-hidden="true" className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Applications are currently closed.</h3>
              </div>
            </div>
          </div>
        </MainWrapper>
      </>
    );
  }

  return (
    <>
      <TopBar
        hideBackdrop
        buttonText={selectedSchool.name}
        buttonHref={`/medibook/schools/${selectedSchool.slug || selectedSchool.id}`}
        hideSearchBar
        title="Delegation Application"
      />
      <MainWrapper>
        <div className="flex flex-col gap-4">
          {!applicationsOpen && !selectedSchoolHasApplication && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <CircleX aria-hidden="true" className="h-5 w-5 text-red-400" />
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
                <div className="shrink-0">
                  <Info aria-hidden="true" className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-zinc-800">
                    Your delegation application has been processed:{" "}
                  </h3>
                  <div className="mt-2 text-sm text-zinc-700">
                    <ul role="list" className="list-disc space-y-1 pl-5">
                      <li>
                        The application fee for this session is {selectedSession.directorPrice}€ per school director and{" "}
                        {selectedSession.delegatePrice}€ per delegate.
                      </li>
                      <li>
                        If you have any questions or need assistance with your application, please contact us at{" "}
                        <Link href="mailto:info@medimun.org">info@medimun.org</Link>.
                      </li>
                      <li>
                        Select all students you will assign to GAs, Security Councils, and other committees below; you
                        will assign the selected students in the next stage.
                      </li>
                      <li>
                        To appear in the list below, students must have a MediBook account, select {selectedSchool.name}{" "}
                        as their school in their account settings, provide a valid birthday, and be aged between{" "}
                        {selectedSession.minimumDelegateAgeOnFirstConferenceDay} and{" "}
                        {selectedSession.maximumDelegateAgeOnFirstConferenceDay} years old on the first day of the
                        conference. For questions about our age policy or if a student who should be listed does not
                        appear, please contact us at <Link href="mailto:info@medimun.org">info@medimun.org</Link>.
                      </li>
                      <li>
                        Once you complete this stage of the application, our team will review and confirm your choices.
                        Your delegates will receive their roles, and you will receive an invoice in the payments section
                        under the School Management tab in the sidebar.
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
                <DescriptionTerm>Number of GA Delegations</DescriptionTerm>
                <DescriptionDetails>
                  {grantedDelegation.countries.filter((c) => c !== "NOTGRANTED").length}
                </DescriptionDetails>
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
                <div className="shrink-0">
                  <Info aria-hidden="true" className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-zinc-800">Important application details before you apply:</h3>
                  <div className="mt-2 text-sm text-zinc-700">
                    <ul role="list" className="list-disc space-y-1 pl-5">
                      <li>
                        Please fill out the form below to apply for a delegation. You can only apply once per session
                        per school.
                      </li>
                      <li>
                        You can&apos;t change your application once it has been submitted, so please make sure all the
                        information is correct before you submit.
                      </li>
                      <li>
                        The application fee for this session is {selectedSession.directorPrice}€ per school director and{" "}
                        {selectedSession.delegatePrice}€ per delegate.
                      </li>
                      <li>
                        If you have any questions or need help with your application, please contact us at{" "}
                        <Link href="mailto:info@medimun.org">info@medimun.org</Link>.
                      </li>
                      <li>
                        You can check the status of your application here, and you will also receive an email once your
                        application has been reviewed and you will have access to the next step.
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
      </MainWrapper>
    </>
  );
}
