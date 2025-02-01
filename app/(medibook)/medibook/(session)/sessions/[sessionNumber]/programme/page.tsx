import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import Paginator from "@/components/pagination";
import { DayTypeMap } from "@/data/constants";
import { auth } from "@/auth";
import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { romanize } from "@/lib/romanize";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Ellipsis } from "lucide-react";
import { FastLink } from "@/components/fast-link";
import { MainWrapper } from "@/components/main-wrapper";

export const metadata = {
	title: "Conference Programme",
	description: "Days of the session",
};

const itemsPerPage = 10;

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const currentPage = searchParams.page || 1;
	const session = await auth();
	const sessionNumber = params.sessionNumber;

	const [selectedSession, days, totalItems] = await prisma
		.$transaction([
			prisma.session.findFirstOrThrow({ where: { number: sessionNumber } }),
			prisma.day.findMany({
				where: { session: { number: sessionNumber } },
				orderBy: [{ type: "asc" }, { date: "asc" }],
				include: { location: true },
				take: itemsPerPage,
				skip: (currentPage - 1) * itemsPerPage,
			}),
			prisma.day.count({ where: { session: { number: params.sessionNumber } } }),
		])
		.catch(notFound);

	let conferenceIndex = 0,
		workshopIndex = 0,
		eventIndex = 0;

	return (
		<>
			<TopBar
				hideBackdrop
				buttonHref={`/medibook/sessions/${sessionNumber}`}
				hideSearchBar
				buttonText={`Session ${romanize(sessionNumber)}`}
				title="Conference Days">
				{authorize(session, [s.admins, s.sd, s.director]) && (
					<SearchParamsButton searchParams={{ "create-day": selectedSession.id }}>Create New</SearchParamsButton>
				)}
			</TopBar>
			<MainWrapper>
				{!!days.length && (
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader>
									<span className="sr-only">Actions</span>
								</TableHeader>
								<TableHeader>Day</TableHeader>
								<TableHeader>Date</TableHeader>
								<TableHeader>Type</TableHeader>
								<TableHeader>Location</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{days.map((day) => {
								if (day.type == "CONFERENCE") {
									conferenceIndex++;
									day.index = conferenceIndex;
								}
								if (day.type == "WORKSHOP") {
									workshopIndex++;
									day.index = workshopIndex;
								}
								if (day.type == "EVENT") {
									eventIndex++;
									day.index = eventIndex;
								}
								const standardName = `${DayTypeMap[day?.type]} Day ${(day?.index).toString()}`;
								return (
									<TableRow key={day.id}>
										<TableCell>
											{authorize(session, [s.admins, s.sd, s.director]) ? (
												<Dropdown>
													<DropdownButton plain aria-label="More options">
														<Ellipsis width={18} />
													</DropdownButton>
													<DropdownMenu anchor="bottom end">
														<DropdownItem
															href={`/medibook/sessions/${params.sessionNumber}/programme/${day.type.toLocaleLowerCase()}${
																["CONFERENCE", "WORKSHOP"].includes(day.type) && "-day"
															}-${day?.index}`}>
															Programme
														</DropdownItem>
														<SearchParamsDropDropdownItem
															searchParams={{
																"edit-day": day.id,
															}}>
															Edit
														</SearchParamsDropDropdownItem>
														<SearchParamsDropDropdownItem
															searchParams={{
																"delete-day": day.id,
															}}>
															Delete
														</SearchParamsDropDropdownItem>
													</DropdownMenu>
												</Dropdown>
											) : (
												<Button
													plain
													href={`/medibook/sessions/${params.sessionNumber}/programme/${day.type.toLocaleLowerCase()}${
														["CONFERENCE", "WORKSHOP"].includes(day.type) && "-day"
													}-${day?.index.toString()}`}>
													View Programme
												</Button>
											)}
										</TableCell>
										<TableCell>{day.name || standardName}</TableCell>
										<TableCell>{day.date.toUTCString().slice(0, 16)}</TableCell>
										<TableCell>
											{day.type == "CONFERENCE" && <Badge color="green">Conference</Badge>}
											{day.type == "WORKSHOP" && <Badge color="yellow">Workshop</Badge>}
											{day.type == "EVENT" && <Badge color="zinc">Event</Badge>}
										</TableCell>
										<TableCell>
											{day?.location?.isPublic ? (
												<FastLink href={`/medibook/locations/${day.location.slug || day.location.id}`}>{day.location?.name}</FastLink>
											) : (
												"-"
											)}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
				<Paginator totalItems={totalItems} itemsOnPage={days.length} />
			</MainWrapper>
		</>
	);
}
