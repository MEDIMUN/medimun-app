import prisma from "@/prisma/client";
import { getOrdinal } from "@/lib/get-ordinal";
import Modal, { DeleteModal } from "./modals";
import { notFound } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Link } from "@nextui-org/link";
import { Tooltip } from "@nextui-org/tooltip";
import * as SolarIconSet from "solar-icon-set";
import Paginator from "@/components/Paginator";
import { Suspense } from "react";
import Icon from "@/components/icon";
import { EditCommitteeButton } from "./buttons";
import { DayTypeMap } from "@/constants";

export const metadata = {
	title: "Conference Days",
	description: "Days of the session",
};

export default async function Page({ params, searchParams }) {
	const daysPerPage = 9;
	const currentPage = searchParams.page || 1;
	const total = await prisma.day.count({ where: { session: { number: params.sessionNumber } } }).catch(notFound);
	let session = await getServerSession(authOptions as any);
	const sessionNumber = params.sessionNumber;

	const selectedSession = await prisma.session
		.findFirst({
			where: {
				number: sessionNumber,
			},
		})
		.catch(notFound);

	const days = await prisma.day
		.findMany({
			where: { session: { number: sessionNumber } },
			orderBy: [{ date: "asc" }],
			include: { location: true },
		})
		.catch(notFound);

	const locations = await prisma.location.findMany().catch(notFound);

	let edit = null;

	if (searchParams.edit) {
		edit = await prisma.day.findFirst({ where: { id: searchParams.edit || "" }, include: { location: true } }).catch(() => notFound());
	}

	let conferenceDays = days
		.filter((day) => day.type == "CONFERENCE")
		.map((day: any, index: number) => {
			day.index = index;
			return day;
		});

	let workshopDays = days
		.filter((day) => day.type == "WORKSHOP")
		.map((day: any, index: number) => {
			day.index = index;
			return day;
		});

	const allDays = [...conferenceDays, ...workshopDays];

	return (
		<>
			<Suspense>
				<Modal locations={locations} edit={edit} selectedSession={selectedSession} />
			</Suspense>
			<DeleteModal />
			<div className="flex w-full grid-cols-3 flex-wrap gap-4 ">
				{(allDays as any).map((day: any, index: number) => (
					<DayCard key={index} day={day} index={index} sessionNumber={sessionNumber} session={session} />
				))}
			</div>
			<div className="mx-auto mt-auto">
				<Suspense fallback={<Paginator page={1} total={1} />}>
					<Paginator page={currentPage} total={Math.ceil((total as number) / daysPerPage)} />
				</Suspense>
			</div>
		</>
	);
}

function DayCard({ day, index, sessionNumber, session }) {
	const date = new Date(day.date).toUTCString().slice(0, 16);
	const today = new Date().toUTCString().slice(0, 16);
	const standardName = `${DayTypeMap[day?.type]} Day ${(day?.index + 1).toString()}`;

	return (
		<li key={index} className="-border flex w-full flex-col gap-2 rounded-xl border-black/10 bg-content1/60 p-4 dark:border-white/20 md:flex-row">
			<div className="flex flex-col gap-1">
				<div className="mb-[-10px] line-clamp-4 flex gap-2 bg-gradient-to-br from-foreground-800 to-foreground-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent dark:to-foreground-200">
					<p>{day?.name ? day?.name : standardName}</p>
					{date == today && <p className="mb-auto mt-[5px] min-w-max rounded-full bg-primary px-2 py-[1px] text-xs font-medium text-white">Today</p>}
				</div>
				<p className="mt-1 line-clamp-2 flex flex-col text-default-400 md:block md:flex-row">
					{day?.location && (
						<>
							<Link showAnchorIcon href={`/medibook/locations/${day?.location?.slug || day?.location?.id}`}>
								{day?.location?.name}
							</Link>
							<span className="mr-[3px] hidden md:inline">•</span>
						</>
					)}
					{day.date.toUTCString().slice(0, 16)}
				</p>
			</div>
			<div className="flex gap-2 md:ml-auto md:flex-row-reverse">
				<Tooltip content="View Committee">
					<Button endContent={<Icon icon="solar:arrow-right-outline" width={20} />} as={Link} href={`/medibook/sessions/${sessionNumber}/days/${day?.type?.toString().toLowerCase()}-day-${day?.index + 1}`} fullWidth className="-border-small my-auto border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10 md:w-full">
						View
					</Button>
				</Tooltip>
				{authorize(session, [s.management]) && (
					<Tooltip content="Edit Committee">
						<EditCommitteeButton committeeId={day.id} />
					</Tooltip>
				)}
			</div>
		</li>
	);
}
