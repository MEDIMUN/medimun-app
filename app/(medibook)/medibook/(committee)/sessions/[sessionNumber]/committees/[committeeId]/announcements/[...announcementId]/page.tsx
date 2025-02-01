import { AnnouncementViewPage } from "@/global-pages/announcements/announcement-page";
import { connection } from "next/server";
import { Suspense } from "react";

export default function Page(props) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AnnouncementPage {...props} />
		</Suspense>
	);
}

export async function AnnouncementPage(props) {
	await connection();
	const searchParams = await props.searchParams;
	const params = await props.params;
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AnnouncementViewPage params={params} searchParams={searchParams} />
		</Suspense>
	);
}
