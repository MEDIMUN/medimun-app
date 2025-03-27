import prisma from "@/prisma/client";
import { DateSelector, RollCallTable } from "./client-components";
import { notFound, redirect } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";
import { MainWrapper } from "@/components/main-wrapper";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { connection } from "next/server";
import { Suspense } from "react";
import { Subheading } from "@/components/heading";
import { Info } from "lucide-react";

export default function Page(props) {
	return (
		<Suspense fallback={<TopBar title="Committee Roll Calls" />}>
			<RollCallsPage {...props} />
		</Suspense>
	);
}

export async function RollCallsPage(props) {
	await connection();
	const searchParams = await props?.searchParams;
	const params = await props?.params;
	const sessionNumber = params.sessionNumber;
	const committeeId = params.committeeId;
	const currentPage = parseInt(searchParams.page) || 1;
	const query = searchParams.search || "";
	const authSession = await auth();

	const [selectedSession, selectedDay] = await prisma.$transaction([
		prisma.session.findFirstOrThrow({
			where: { number: sessionNumber },
			include: {
				Day: { orderBy: [{ type: "asc" }, { date: "asc" }] },
				committee: {
					where: { OR: [{ id: committeeId }, { slug: committeeId }] },
					take: 1,
					include: {
						ExtraCountry: true,
						delegate: {
							where: {
								OR: [
									{ country: { contains: query, mode: "insensitive" } },
									{
										user: {
											OR: [{ officialName: { contains: query, mode: "insensitive" } }, { officialSurname: { contains: query, mode: "insensitive" } }, { displayName: { contains: query, mode: "insensitive" } }],
										},
									},
								],
							},
							include: {
								user: {
									include: {
										MorningPresent: { select: { dayId: true }, where: { dayId: searchParams.day } },
										CommitteeRollCall: { where: { rollCall: { dayId: searchParams.day } } },
									},
								},
							},
							orderBy: { country: "asc" },
						},
					},
				},
			},
		}),
		prisma.day.findUnique({
			where: { id: searchParams.day || "" },
			include: { RollCall: { orderBy: { index: "asc" } } },
		}),
	]);

	if (searchParams.day && !selectedDay) notFound();
	if (!selectedDay) {
		redirect(
			`/medibook/sessions/${sessionNumber}/committees/${committeeId}/roll-calls?day=${selectedSession.Day[0].id}${searchParams.search ? `&search=${searchParams.search}` : ""}${searchParams.page ? `&page=${searchParams.page}` : ""}`
		);
	}

	const delegates = selectedSession.committee[0].delegate;
	const rollCalls = selectedDay.RollCall;
	/* 	const todayDateObject = new Date().toISOString().split("T")[0].concat("T00:00:00.000Z");
	 */

	/* 
	const selectedTodaysDay = selectedSession.Day.find((day) => {
		const todayObject = new Date(todayDateObject);
		return todayObject.toDateString() === day.date.toDateString();
	}); */

	const isManagement = authorize(authSession, [s.management]);
	const isChairOfCommittee = authSession && authorizeChairCommittee(authSession?.user?.currentRoles, selectedSession.committee[0].id);

	const isEditor = (authSession && isManagement) || isChairOfCommittee;

	const days = selectedSession.Day;
	const selectedCommittee = selectedSession.committee[0];
	if (!selectedCommittee) notFound();

	const conferenceDays = days
		.filter((day) => day.type === "CONFERENCE")
		.map((day, index) => {
			return { ...day, title: `Conference Day ${index + 1}` };
		});

	const workshopDays = days
		.filter((day) => day.type === "WORKSHOP")
		.map((day, index) => {
			return { ...day, title: `Workshop Day ${index + 1}` };
		});

	return (
		<>
			<TopBar buttonText={selectedCommittee.name} buttonHref={`/medibook/sessions/${selectedSession.number}/committees/${selectedCommittee.slug || selectedCommittee.id}`} title="Committee Roll Calls">
				<DateSelector conferenceDays={conferenceDays} workshopDays={workshopDays} />
			</TopBar>
			<MainWrapper>
				<div className="rounded-md bg-neutral-100 p-4">
					<div className="flex">
						<div className="shrink-0">
							<Info aria-hidden="true" className="size-5 text-neutral-400" />
						</div>
						<div className="ml-3 flex-1 md:flex md:justify-between">
							<p className="text-sm text-neutral-700">
								Delegates can <b>not</b> be marked as absent or request to be treated as absent during the debate if they are physically present in the committee room.
							</p>
						</div>
					</div>
				</div>
				<RollCallTable isEditor={isEditor} selectedDayId={searchParams?.day || null} selectedCommittee={selectedCommittee} delegates={delegates} rollCallsInit={rollCalls} />
			</MainWrapper>
		</>
	);
}
