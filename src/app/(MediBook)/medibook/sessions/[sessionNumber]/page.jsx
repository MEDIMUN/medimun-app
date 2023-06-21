import prisma from "@/prisma/client";
import { error } from "console";
import { notFound, redirect } from "next/navigation";
import { getOrdinal } from "@lib/get-ordinal";
import SubMenu from "./SubMenu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export async function generateMetadata({ params }) {
	const ordinal = getOrdinal(params.selectedSession);

	return {
		title: `${params.sessionNumber + ordinal} Annual Session - MediBook`,
		description: `${params.sessionNumber + ordinal} Annual Session of the Mediterranean Model United Nations`,
	};
}

export default async function Page({ params, searchParams }) {
	const { selectedSession, delegateCount, chairCount, memberCount, managerCount, currentSession } = await getData(params);
	const ordinal = getOrdinal(selectedSession.number);
	const staffCount = chairCount + memberCount + managerCount;
	let showEditDrawer = searchParams.hasOwnProperty("edit");
	return (
		<>
			<SubMenu />
			<div className={`py-5 px-auto text-3xl p-5  align-middle justify-center font-extralight bg-gradient-to-r ${selectedSession.isCurrent && "from-sky-500 to-indigo-500 text-white"}`}>
				<div className="max-w-[1165px] mx-auto  flex flex-row">
					<div>
						{selectedSession.number}
						<sup>{ordinal}</sup> Annual Session
					</div>
					<div className="ml-auto">
						<Link href={`/medibook/sessions/${selectedSession.number}?edit`}>
							<Button className={`${selectedSession.isCurrent && "bg-white text-black"}`}>Edit</Button>
						</Link>
					</div>
				</div>
			</div>
			<div className="w-fill border-t-[1px] border-[#EAEAEA]" />
			<div className="mt-5 mx-auto max-w-[1200px] text-3xl p-5 font-extralight">
				<div>
					<div>Number of Delegates {delegateCount}</div>
					<div>Number of Student Volunteers {staffCount}</div>
					{showEditDrawer && <div>HAHHAHAHH</div>}
					<div></div>
					<div></div>
					<div></div>
				</div>
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
		[selectedSession, delegateCount, chairCount, memberCount, managerCount, currentSession] = await Promise.all([selectedSession, delegateCount, chairCount, memberCount, managerCount, currentSession]);
		console.log(selectedSession, delegateCount, chairCount, memberCount, managerCount, currentSession);
	} catch (e) {
		console.log(e);
	}

	return { selectedSession, delegateCount, chairCount, memberCount, managerCount, currentSession };
}
