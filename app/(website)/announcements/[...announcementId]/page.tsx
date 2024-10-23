import prisma from "@/prisma/client";
import { AnnouncementViewPage } from "../../server-components";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ announcementId: string }> }) {
	const params = await props.params;
	const selectedAnnouncement = await prisma.announcement.findFirst({
		where: { id: params.announcementId[0] },
		include: { session: { select: { number: true } } },
	});
	return {
		title: `${selectedAnnouncement.title} • Announcements`,
		...(selectedAnnouncement.description && { description: selectedAnnouncement.description }),
	};
}

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	return <AnnouncementViewPage params={params} searchParams={searchParams} />;
}
