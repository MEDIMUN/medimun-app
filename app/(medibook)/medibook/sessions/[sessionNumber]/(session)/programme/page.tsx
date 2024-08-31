import prisma from "@/prisma/client";
import Modal, { DeleteModal } from "./modals";
import { notFound } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Link } from "@nextui-org/link";
import { Tooltip } from "@nextui-org/tooltip";
import Paginator from "@/components/Paginator";
import { Suspense } from "react";
import Icon from "@/components/icon";
import { EditCommitteeButton } from "./buttons";
import { DayTypeMap } from "@/constants";
import { auth } from "@/auth";
import { CardsTable, TableCard, TableCardBody, TableCardChip, TableCardFooter } from "@/components/medibook/table";
import { cn } from "@/lib/cn";

export const metadata = {
	title: "Conference Days",
	description: "Days of the session",
};

export default async function Page({ params, searchParams }) {
	const daysPerPage = 9;
	const currentPage = searchParams.page || 1;
	const total = await prisma.day.count({ where: { session: { number: params.sessionNumber } } }).catch(notFound);
	const session = await auth();
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
	//put today to the top
	allDays.sort((a, b) => {
		if (a.date.toDateString() == new Date().toDateString()) return -1;
		if (b.date.toDateString() == new Date().toDateString()) return 1;
		return a.date - b.date;
	});

	return (
		<CardsTable
			emptyTitle="No Days Added Yet"
			emptyDescription="Check out other sessions"
			emptyHref={`/medibook/sessions`}
			currentPage={currentPage}
			total={Math.ceil((total as number) / daysPerPage)}
			modals={[<Modal locations={locations} edit={edit} selectedSession={selectedSession} />, <DeleteModal />]}>
			{allDays.map((day: any, index: number) => {
				const date = new Date(day.date).toUTCString().slice(0, 16);
				const today = new Date().toUTCString().slice(0, 16);
				const standardName = `${DayTypeMap[day?.type]} Day ${(day?.index + 1).toString()}`;
				const isToday = date == today;
				const isPreviousToday = allDays[index - 1]?.date.toUTCString().slice(0, 16) == today;
				return (
					<TableCard
						hideBorder={index == allDays.length - 1}
						title={<p className={cn(isToday && "text-white")}>{day?.name ? day?.name : standardName}</p>}
						className={cn(
							isPreviousToday && "rounded-t-xl",
							isToday && "mb-4 rounded-xl border-none bg-[url(/gradients/1.jpg)] bg-cover hover:bg-primary hover:shadow-lg"
						)}
						key={index}>
						<TableCardBody className={cn(isToday && "text-white")}>
							<TableCardChip classNames={{ content: "px-0" }} className="text-sm shadow-none" color="">
								{day.date.toUTCString().slice(0, 16)}
							</TableCardChip>
							{day?.location?.name && (
								<TableCardChip className="text-sm">
									{"at "}
									<Link showAnchorIcon href={`/medibook/locations/${day?.location?.slug || day?.location?.id}`} className="text-sm">
										{day?.location?.name}
									</Link>
								</TableCardChip>
							)}
						</TableCardBody>
						<TableCardFooter>
							{authorize(session, [s.management]) && <EditCommitteeButton className="border-r text-inherit" committeeId={day.id} />}
							<Button
								endContent={<Icon icon="solar:arrow-right-outline" width={18} />}
								as={Link}
								className="text-inherit"
								href={`/medibook/sessions/${sessionNumber}/program/${day?.type?.toString().toLowerCase()}-day-${day?.index + 1}`}
								fullWidth>
								Programme
							</Button>
						</TableCardFooter>
					</TableCard>
				);
			})}
		</CardsTable>
	);
}
