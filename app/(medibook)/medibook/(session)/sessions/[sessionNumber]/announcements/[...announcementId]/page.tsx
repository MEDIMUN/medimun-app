import { AnnouncementViewPage } from "@/global-pages/announcements/announcement-page";

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	return <AnnouncementViewPage params={params} searchParams={searchParams} />;
}
