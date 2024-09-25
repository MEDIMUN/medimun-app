import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { ApplicationOptions, CountryAssign } from "./client-components";
import { Text } from "@/components/text";

export function areDelegateApplicationsOpen(selectedSession) {
	if (!selectedSession) return false;
	//if not current session
	if (!selectedSession.isCurrent) return false;
	//if force open is on
	if (selectedSession.isDelegateApplicationsForceOpen) return true;
	//if auto closed or not auto open
	if (!selectedSession.isDelegateApplicationsAutoOpen) return false;
	const now = new Date();
	return selectedSession.delegateApplicationsAutoOpenTime < now && selectedSession.delegateApplicationsAutoCloseTime > now;
}

export default async function Page({ params }) {
	const selectedSession = await prisma.session.findFirst({
		where: { number: params.sessionNumber },
		include: { ApplicationGrantedDelegationCountries: true },
	});

	const applicationsOfSession = await prisma.applicationDelegationPreferences.findMany({
		where: { session: { number: selectedSession.number } },
		orderBy: { date: "asc" },
		include: { school: true },
	});

	const schools = await prisma.school.findMany();

	const areApplicationsOpen = areDelegateApplicationsOpen(selectedSession);

	return (
		<>
			<TopBar
				buttonText={`Session ${romanize(selectedSession.numberInteger)} Applications`}
				buttonHref={`/medibook/sessions/${selectedSession.number}/applications`}
				hideSearchBar
				title="Delegation Requests"
			/>
			<div className="mt-5 rounded-md bg-zinc-950/5 p-4 ring-1 ring-zinc-950/10">
				<Text>{areApplicationsOpen ? "Applications are currently open." : "Applications are currently closed."}</Text>
			</div>
			<ApplicationOptions selectedSession={selectedSession} />
			<CountryAssign selectedSession={selectedSession} applicationsOfSession={applicationsOfSession} schools={schools} />
		</>
	);
}
