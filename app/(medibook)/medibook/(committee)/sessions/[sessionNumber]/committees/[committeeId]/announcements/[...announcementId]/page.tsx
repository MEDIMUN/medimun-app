import { AnnouncementViewPage } from "@/app/(medibook)/medibook/server-components";
import { connection } from "next/server";

export default async function Page(props) {
	await connection();
	const searchParams = await props.searchParams;
	const params = await props.params;
	return <AnnouncementViewPage params={params} searchParams={searchParams} />;
}
