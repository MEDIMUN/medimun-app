import { authorizedToEditAnnouncement } from "@/app/(medibook)/medibook/@announcement/default";
import { PageCreateAnnouncement } from "@/app/(medibook)/medibook/@announcement/pageCreateAnnouncement";
import { SearchParamsButton } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { MainWrapper } from "@/components/main-wrapper";
import { TopBar } from "@/components/top-bar";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

export async function AnnouncementViewPage({ params, searchParams }) {
	await connection();
	const authSession = await auth();
	let selectedAnnouncement, selectedCommittee, selectedDepartment, selectedSession;
	try {
		selectedAnnouncement = await prisma.announcement.update({
			where: { id: params.announcementId[0] },
			data: { views: { increment: 1 } },
			include: {
				session: true,
				committee: { include: { session: true } },
				department: { include: { session: true } },
				user: true,
			},
		});
	} catch (e) {
		if (!(params.announcementId[0] === "publish")) notFound();
	}

	let baseUrl = "/medibook/announcements";
	let buttonText = "Global Announcements";
	let buttonHref = "/medibook/announcements";
	let createType: "globalAnnouncement" | "sessionAnnouncement" | "committeeAnnouncement" | "departmentAnnouncement" = "globalAnnouncement";

	if (params.sessionNumber && !params.committeeId && !params.departmentId) {
		const selectedSession = await prisma.session.findUnique({
			where: {
				number: params.sessionNumber,
			},
		});
		baseUrl = `/medibook/sessions/${selectedSession.number}/announcements`;
		buttonText = `Session ${romanize(selectedSession.numberInteger)} Announcements`;
		buttonHref = `/medibook/sessions/${selectedSession.number}/announcements`;
		createType = "sessionAnnouncement";
	}

	if (params.committeeId && !params.departmentId && params.sessionNumber) {
		selectedCommittee = await prisma.committee.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.committeeId, session: { number: params.sessionNumber } },
					{ slug: params.committeeId, session: { number: params.sessionNumber } },
				],
			},
			include: { session: true },
		});
		baseUrl = `/medibook/sessions/${selectedCommittee.session.number}/committees/${selectedCommittee.slug || selectedCommittee.id}/announcements`;
		buttonText = `${selectedCommittee.name} Announcements`;
		buttonHref = `/medibook/sessions/${selectedCommittee.session.number}/committees/${selectedCommittee.slug || selectedCommittee.id}/announcements`;
		createType = "committeeAnnouncement";
	}

	if (params.departmentId && !params.committeeId && params.sessionNumber) {
		selectedDepartment = await prisma.department.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.departmentId, session: { number: params.sessionNumber } },
					{ slug: params.departmentId, session: { number: params.sessionNumber } },
				],
			},
			include: { session: true },
		});
		baseUrl = `/medibook/sessions/${selectedDepartment.session.number}/departments/${selectedDepartment.slug || selectedDepartment.id}/announcements`;
		buttonText = `${selectedDepartment.name} Announcements`;
		buttonHref = `/medibook/sessions/${selectedDepartment.session.number}/departments/${selectedDepartment.slug || selectedDepartment.id}`;
		createType = "departmentAnnouncement";
	}

	if (selectedAnnouncement?.slug !== params?.announcementId[1]) {
		if (selectedAnnouncement?.slug) return redirect(`${baseUrl}/${selectedAnnouncement.id}/${selectedAnnouncement.slug}`);
	}

	if (params.announcementId[0] === "publish") {
		return <PageCreateAnnouncement committeeId={selectedCommittee?.id} departmentId={selectedDepartment?.id} returnUrl={baseUrl} type={createType} />;
	}

	if (searchParams["edit-announcement"]) {
		return null;
	}

	if (!selectedAnnouncement) return;

	const authorizedToEdit = authorizedToEditAnnouncement(authSession, selectedAnnouncement);

	return (
		<>
			<TopBar
				hideBackdrop
				hideSearchBar
				buttonHref={buttonHref}
				buttonText={buttonText}
				title={selectedAnnouncement.title}
				subheading={selectedAnnouncement.description}>
				{authorizedToEdit && (
					<SearchParamsButton color="red" searchParams={{ "delete-announcement": selectedAnnouncement.id }}>
						Delete
					</SearchParamsButton>
				)}
				{authorizedToEdit && <SearchParamsButton searchParams={{ "edit-announcement": selectedAnnouncement.id }}>Edit</SearchParamsButton>}
			</TopBar>
			<MainWrapper>
				<Suspense fallback={<div>404</div>}>
					{/* @ts-ignore */}
					<MDXRemote components={{ ...announcementWebsitecomponents }} source={selectedAnnouncement.markdown} />
				</Suspense>
			</MainWrapper>
		</>
	);
}
