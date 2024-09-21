import prisma from "@/prisma/client";
import Modal, { DeleteModal } from "./modals";
import { notFound } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Link } from "@nextui-org/link";
import { Tooltip } from "@nextui-org/tooltip";
import Paginator from "@/components/pagination";
import { DayTypeMap } from "@/data/constants";
import { auth } from "@/auth";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { romanize } from "@/lib/romanize";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";

export const metadata = {
	title: "Conference Days",
	description: "Days of the session",
};

const itemsPerPage = 10;

export default async function Page({ params, searchParams }) {
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
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${sessionNumber}`}
				hideSearchBar
				buttonText={`Session ${romanize(sessionNumber)}`}
				title="Conference Days">
				{authorize(session, [s.sd, s.admins, s.director]) && (
					<SearchParamsButton searchParams={{ "create-day": selectedSession.id }}>Create New</SearchParamsButton>
				)}
			</TopBar>
			<Table>
				<TableHead>
					<TableRow>
						<TableHeader>Day</TableHeader>
						<TableHeader>Date</TableHeader>
						<TableHeader>
							<span className="sr-only">Actions</span>
						</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{allDays.map((day) => {
						const standardName = `${DayTypeMap[day?.type]} Day ${(day?.index + 1).toString()}`;

						return (
							<TableRow key={day.handle}>
								<TableCell>{day.name || standardName}</TableCell>
								<TableCell>{day.date.toUTCString().slice(0, 16)}</TableCell>
								<TableCell>
									<Dropdown>
										<DropdownButton plain aria-label="More options">
											<EllipsisHorizontalIcon />
										</DropdownButton>
										<DropdownMenu anchor="bottom end">
											<DropdownItem>View</DropdownItem>
											<DropdownItem>Edit</DropdownItem>
											<DropdownItem>Delete</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<Paginator totalItems={total} itemsOnPage={allDays.length} />
		</>
	);
}
