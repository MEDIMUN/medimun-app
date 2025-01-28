import { AnnouncementViewPage } from "@/app/(medibook)/medibook/server-components";

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	return <AnnouncementViewPage params={params} searchParams={searchParams} />;
}
