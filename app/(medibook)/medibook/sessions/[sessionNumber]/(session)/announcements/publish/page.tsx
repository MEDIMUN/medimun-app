import { auth } from "@/auth";
import {
	authorizedToEditAnnouncement,
	innerAnnouncementScopeList,
	typeGreaterScopeMapList,
} from "@/app/(medibook)/medibook/@announcementModals/default";
import { notFound } from "next/navigation";
import { PageCreateAnnouncement } from "@/app/(medibook)/medibook/@announcementModals/pageCreateAnnouncement";

const selectedAnnouncementType = "sessionAnnouncement";

export default async function Page({ params }) {
	const authSession = await auth();

	const submittedScope = innerAnnouncementScopeList?.[typeGreaterScopeMapList?.[selectedAnnouncementType]?.[0]?.value]?.map((scope) => scope?.value);
	const scopeMap = authorizedToEditAnnouncement(authSession, params.committeeId, params.departmentId);
	const arrayOfBooleanScope = submittedScope.map((scope) => scopeMap[scope]);
	if (arrayOfBooleanScope.includes(false)) notFound();

	return <PageCreateAnnouncement type="globalAnnouncement" returnUrl={`/medibook/sessions/${params.sessionNumber}/announcements`} />;
}
