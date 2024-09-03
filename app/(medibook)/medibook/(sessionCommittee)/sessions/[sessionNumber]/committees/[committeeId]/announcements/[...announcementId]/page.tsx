import { AnnouncementViewPage } from "@/app/(medibook)/medibook/server-components";

export default async function Page({ params, searchParams }) {
	return <AnnouncementViewPage params={params} searchParams={searchParams} />;
}
