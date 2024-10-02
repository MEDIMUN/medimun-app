import prisma from "@/prisma/client";
import { notFound, redirect } from "next/navigation";
import { DateSelector, MoveDownButton, MoveUpButton } from "./client-components";
import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { romanize } from "@/lib/romanize";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import Paginator from "@/components/pagination";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { Badge } from "@/components/badge";

export default async function Page({ params, searchParams }) {
	const authSession = await auth();
	if (!authSession || !authorize(authSession, [s.management])) return notFound();

	const [days, rollCalls] = await prisma
		.$transaction([
			prisma.day.findMany({
				where: { session: { number: params.sessionNumber } },
				orderBy: [{ type: "asc" }, { date: "asc" }],
				select: { id: true, date: true, type: true, name: true },
			}),
			prisma.rollCall.findMany({
				where: { day: { id: searchParams?.["selected-day"] } },
				orderBy: { index: "asc" },
				include: { day: true },
			}),
		])
		.catch(notFound);

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

	const currentDay = days.find((day) => day.date.toDateString() === new Date().toDateString()) || null;
	const currentDayId = currentDay?.id || null;

	if (searchParams?.["selected-day"]) {
		const selectedDay = days.find((day) => day.id === searchParams?.["selected-day"]);
		if (!selectedDay && !currentDayId) redirect(`/medibook/sessions/${params.sessionNumber}/roll-calls`);
	}

	if (!searchParams?.["selected-day"] && currentDayId) redirect(`/medibook/sessions/${params.sessionNumber}/roll-calls?selected-day=${currentDayId}`);

	return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${params.sessionNumber}`}
				hideSearchBar
				buttonText={`Session ${romanize(params.sessionNumber)}`}
				title="Roll Calls">
				<DateSelector className="ml-auto md:max-w-[300px]" conferenceDays={conferenceDays} workshopDays={workshopDays} />
				<SearchParamsButton
					disabled={rollCalls.length > 9}
					className="min-w-max"
					searchParams={{ "create-roll-call": searchParams?.["selected-day"] }}>
					Create New
				</SearchParamsButton>
			</TopBar>
			{!!rollCalls?.length && (
				<Table>
					<TableHead>
						<TableRow>
							<TableHeader>
								<span className="sr-only">Actions</span>
							</TableHeader>
							<TableHeader>
								<span className="sr-only">Index</span>
							</TableHeader>
							<TableHeader>Name</TableHeader>
							<TableHeader>ID</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{rollCalls.map((rc, index) => (
							<TableRow key={rc.id}>
								<TableCell>
									<Dropdown>
										<DropdownButton plain>
											<EllipsisHorizontalIcon />
										</DropdownButton>
										<DropdownMenu>
											<MoveUpButton rcId={rc.id} />
											<MoveDownButton rcId={rc.id} />
											<SearchParamsDropDropdownItem searchParams={{ "edit-roll-call": rc.id }}>Edit</SearchParamsDropDropdownItem>
											<SearchParamsDropDropdownItem searchParams={{ "delete-roll-call": rc.id }}>Delete</SearchParamsDropDropdownItem>
										</DropdownMenu>
									</Dropdown>
								</TableCell>
								<TableCell>
									<Badge>{index + 1}</Badge>
								</TableCell>
								<TableCell>{rc.name || `Roll Call ${index + 1}`}</TableCell>
								<TableCell>{rc.id}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
			<Paginator totalItems={rollCalls.length} itemsOnPage={rollCalls.length} />
		</>
	);
}
