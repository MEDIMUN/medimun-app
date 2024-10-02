import { AnnouncementViewPage } from "@/app/(medibook)/medibook/server-components";
import prisma from "@/prisma/client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { announcementId: string } }) {
	const selectedAnnouncement = await prisma.announcement.findFirst({
		where: { id: params.announcementId[0] },
		include: { session: { select: { number: true } } },
	});
	return {
		title: `${selectedAnnouncement.title} Announcements`,
		...(selectedAnnouncement.description && { description: selectedAnnouncement.description }),
	};
}

export default async function Page({ params, searchParams }) {
	return <AnnouncementViewPage params={params} searchParams={searchParams} />;
}
