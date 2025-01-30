import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { Button } from "@/components/button";
import { cn } from "@/lib/cn";
import { Text } from "@/components/text";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { countries } from "@/data/countries";
import { Badge } from "@/components/badge";
import { statusMap } from "../page";
import Link from "next/link";
import { MainWrapper } from "@/components/main-wrapper";
import { ResourceViewer } from "@/components/resource-viewer";

export default async function ViewPositionPaper(props) {
	const authSession = await auth();
	if (!authSession) notFound();
	const seachParams = await props.searchParams;

	const isManagement = authorize(authSession, [s.management]);

	const params = await props.params;
	const sessionNumber = params.sessionNumber;
	const committeeId = params.committeeId;

	const selectedCommittee = await prisma.committee.findFirst({
		where: {
			OR: [{ slug: committeeId }, { id: committeeId }],
			session: { number: sessionNumber },
		},
		include: {
			ExtraCountry: true,
		},
	});

	if (!selectedCommittee) notFound();

	const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee?.id);

	const selectedPositionPaper = await prisma.positionPaper.findFirst({
		where: {
			committeeId: selectedCommittee.id,
			id: params.paperId,
		},
		include: {
			resource: true,
			committee: {
				select: {
					isPositionPapersVisible: true,
				},
			},
			user: {
				include: {
					delegate: {
						where: { committeeId: selectedCommittee.id },
					},
				},
			},
		},
	});

	if (!selectedPositionPaper) notFound();

	const isSubmitterOfPositionPaper = selectedPositionPaper.userId === authSession.user.id;
	const isDelegateOfCommittee = authorizeDelegateCommittee(
		(authSession?.user?.currentRoles || []).concat(authSession?.user?.pastRoles || []),
		selectedCommittee?.id
	);

	if (!isManagement && !isChairOfCommittee && !isSubmitterOfPositionPaper && !selectedPositionPaper.committee.isPositionPapersVisible) notFound();

	if (
		!isManagement &&
		!isChairOfCommittee &&
		!isDelegateOfCommittee &&
		selectedPositionPaper.committee.isPositionPapersVisible &&
		!selectedPositionPaper.status === "APPROVED"
	)
		notFound();

	if (!isManagement && !isChairOfCommittee && !isSubmitterOfPositionPaper && selectedPositionPaper.status === "REVISION") notFound();

	const fullName =
		selectedPositionPaper.user.displayName || `${selectedPositionPaper.user.officialName} ${selectedPositionPaper.user.officialSurname}`;

	const allCountries = countries.concat(selectedCommittee.ExtraCountry || []);

	const selectedCountry = allCountries.find((country) => country.countryCode === selectedPositionPaper.user.delegate[0].country);

	return (
		<>
			<TopBar
				hideBackdrop
				hideSearchBar
				buttonHref={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/position-papers`}
				buttonText={`${selectedCommittee.name} Position Papers`}
				title={`Position Paper of ${selectedCountry?.countryNameEn || fullName}`}>
				{(isChairOfCommittee || isManagement) && (
					<SearchParamsButton color="red" searchParams={{ "delete-position-paper": selectedPositionPaper.id }}>
						Delete
					</SearchParamsButton>
				)}
				{selectedPositionPaper.status == "PENDING" && (isChairOfCommittee || isManagement) && (
					<SearchParamsButton searchParams={{ "return-position-paper": selectedPositionPaper.id }}>Return</SearchParamsButton>
				)}
			</TopBar>
			<MainWrapper>
				<div>
					<DescriptionList>
						<DescriptionTerm>Submitter</DescriptionTerm>
						<DescriptionDetails>{selectedCountry?.countryNameEn}</DescriptionDetails>

						<DescriptionTerm>Delegate</DescriptionTerm>
						<DescriptionDetails>
							<Link
								href={`/medibook/users/${selectedPositionPaper.user.username || selectedPositionPaper.user.id}`}
								className="text-blue-600 hover:underline">
								{fullName}
							</Link>
						</DescriptionDetails>
						{(isSubmitterOfPositionPaper || isManagement || isChairOfCommittee) && (
							<>
								<DescriptionTerm>Submitted</DescriptionTerm>
								<DescriptionDetails>{selectedPositionPaper.createdAt.toLocaleString("en-GB").replace(", ", " at ") || "-"}</DescriptionDetails>

								<DescriptionTerm>Status</DescriptionTerm>
								<DescriptionDetails>
									<Badge color={statusMap[selectedPositionPaper.status].color}>{statusMap[selectedPositionPaper.status].name.split(" &")[0]}</Badge>
								</DescriptionDetails>

								<DescriptionTerm>Returned</DescriptionTerm>
								<DescriptionDetails>
									{selectedPositionPaper.returnTime ? selectedPositionPaper.returnTime.toLocaleString("en-GB").replace(", ", " at ") : "-"}
								</DescriptionDetails>
								<DescriptionTerm>Chair Comments</DescriptionTerm>
								<DescriptionDetails>{selectedPositionPaper.chairComment || "-"}</DescriptionDetails>
							</>
						)}
					</DescriptionList>
				</div>

				<ResourceViewer resourceId={selectedPositionPaper.resourceId} />
			</MainWrapper>
		</>
	);
}
