import prisma from "@/prisma/client";
import { getOrdinal } from "@lib/get-ordinal";
import { Button } from "@/components/ui/button";
import Drawer from "./Drawer";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
export async function generateMetadata({ params }) {
	const ordinal = getOrdinal(params.selectedSession);

	return {
		title: `${params.sessionNumber + ordinal} Annual Session - MediBook`,
		description: `${params.sessionNumber + ordinal} Annual Session of the Mediterranean Model United Nations`,
	};
}

export default async function Page({ params, searchParams }) {
	const session = await getServerSession(authOptions);
	const { selectedSession, delegateCount, chairCount, memberCount, managerCount, currentSession } = await getData(params);
	const ordinal = getOrdinal(selectedSession.number);
	const staffCount = chairCount + memberCount + managerCount;
	return (
		<>
			<Drawer selectedSession={selectedSession} />
			<TitleBar
				title={`${selectedSession.number + ordinal} Annual Session`}
				description={`${delegateCount} Delegates and ${staffCount} Organisers`}
				button1roles={[s.sd, s.director, s.admins, s.secretariat]}
				button1text="Edit"
				button1href={`/medibook/sessions/${selectedSession.number}?edit`}
				button1style="text-black bg-white"
			/>

			<div className="mx-auto mt-5 flex max-w-[1200px] flex-col text-3xl font-extralight">
				<h2>{selectedSession.theme}</h2>
				{selectedSession.phrase2}
			</div>
		</>
	);
}

async function getData(params) {
	prisma.$connect();
	let selectedSession;
	let delegateCount;
	let chairCount;
	let memberCount;
	let managerCount;
	let currentSession;

	try {
		selectedSession = prisma.session.findFirstOrThrow({
			where: { number: params.sessionNumber },
		});
		delegateCount = prisma.delegate.count({
			where: { committee: { session: { number: params.sessionNumber } } },
		});
		chairCount = prisma.chair.count({
			where: { committee: { session: { number: params.sessionNumber } } },
		});
		memberCount = prisma.member.count({
			where: { department: { session: { number: params.sessionNumber } } },
		});
		managerCount = prisma.manager.count({
			where: { department: { session: { number: params.sessionNumber } } },
		});
		currentSession = prisma.session.findFirst({
			where: { isCurrent: true },
			select: { number: true },
		});
		[selectedSession, delegateCount, chairCount, memberCount, managerCount, currentSession] = await Promise.all([
			selectedSession,
			delegateCount,
			chairCount,
			memberCount,
			managerCount,
			currentSession,
		]);
	} catch (e) {}

	return { selectedSession, delegateCount, chairCount, memberCount, managerCount, currentSession };
}
