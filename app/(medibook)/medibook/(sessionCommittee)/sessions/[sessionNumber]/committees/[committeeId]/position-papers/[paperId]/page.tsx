import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { minio } from "@/minio/client";
import { Button } from "@/components/button";
import { cn } from "@/lib/cn";
import { Text } from "@/components/text";
import mimeExt from "mime-ext";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { countries } from "@/data/countries";
import { Badge } from "@/components/badge";
import { statusMap } from "../page";

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

	let frameUrl = "";

	const selectedResource = selectedPositionPaper.resource;

	if (!selectedResource) notFound();

	if (selectedResource.driveUrl) {
		frameUrl = `https://${selectedResource.driveUrl}`;
	}

	let presignedUrl = "";

	if (selectedResource.fileId) {
		const minioClient = minio();
		presignedUrl = await minioClient.presignedGetObject(process.env.BUCKETNAME, `resources/${selectedResource.fileId}`, 30 * 60);

		const mimeTypesGoogleDocsCanOpen = [
			"application/vnd.google-apps.document",
			"application/vnd.google-apps.spreadsheet",
			"application/vnd.google-apps.presentation",
			"application/vnd.google-apps.drawing",
			"application/vnd.google-apps.script",
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/msword",
		];

		//word document
		if (mimeTypesGoogleDocsCanOpen.includes(selectedResource.mimeType)) {
			presignedUrl = presignedUrl.replace("http://", "https://");
			presignedUrl = encodeURIComponent(presignedUrl);
			frameUrl = `https://docs.google.com/gview?embedded=true&url=${presignedUrl}`;
		}
	}

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
				{selectedPositionPaper.status == "REVISION" && (isChairOfCommittee || isManagement) && (
					<SearchParamsButton searchParams={{ "return-position-paper": selectedPositionPaper.id }}>Return</SearchParamsButton>
				)}
				<SearchParamsButton searchParams={{ full: "true" }}>Full Screen</SearchParamsButton>
				<Button
					href={selectedResource ? decodeURIComponent(presignedUrl.replace("http://", "https://")) : frameUrl}
					target="_blank"
					download={selectedResource ? `PositionPaper.${mimeExt(selectedResource.mimeType)[0]}` : false}>
					Download
				</Button>
			</TopBar>
			<div>
				<DescriptionList>
					<DescriptionTerm>Submitter</DescriptionTerm>
					<DescriptionDetails>{selectedCountry?.countryNameEn}</DescriptionDetails>

					<DescriptionTerm>Delegate</DescriptionTerm>
					<DescriptionDetails>{fullName}</DescriptionDetails>
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
			<div className={cn("bg-zinc-200 rounded-md overflow-scroll w-full h-full !min-h-[512px]")}>
				{frameUrl && <iframe className="h-full min-h-[800px]" src={frameUrl} width="100%" height="100%" />}
			</div>
			{seachParams.full == "true" && (
				<div className={cn("bg-zinc-200 rounded-md w-full h-full fixed top-0 left-0 right-0 bottom-0 z-[2000]", seachParams.full == "true")}>
					<div className="w-full h-16 p-4 flex">
						<Text className="my-auto">
							Viewing the position paper of {fullName} {selectedCountry && `-`} {selectedCountry?.countryNameEn}
						</Text>
						<SearchParamsButton
							deleteSearchParams={{
								full: "true",
							}}
							className="ml-auto">
							Close
						</SearchParamsButton>
					</div>
					<iframe className="h-full" src={frameUrl} width="100%" height="100%" />
				</div>
			)}
		</>
	);
}
