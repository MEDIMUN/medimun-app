import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { MainWrapper } from "@/components/main-wrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { authorize, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import { cn } from "@/lib/utils";
import prisma from "@/prisma/client";
import { Ellipsis } from "lucide-react";
import { Suspense } from "react";

export default function Page(number) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SpecificDaySchedule {...number} />
		</Suspense>
	);
}

export async function SpecificDaySchedule(props) {
	const dayName = (await props?.params)?.dayName;
	const sessionNumber = (await props?.params)?.sessionNumber;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	const dayNameLower = dayName.toUpperCase();
	const dayNameParts = dayNameLower.split("-");

	const dayType = dayNameParts[0];
	const dayIndex = parseInt(dayNameParts[2]);

	const selectedDayPrisma = await prisma.day.findMany({
		where: { session: { number: sessionNumber }, type: dayType },
		skip: dayIndex - 1,
		take: 1,
		include: { DayEvent: true, session: true },
	});

	const selectedDay = selectedDayPrisma[0];
	const sortedEvents = selectedDay.DayEvent.sort((a, b) => parseInt(a.startTime.replace(":", "")) - parseInt(b.startTime.replace(":", "")));
	const currentTime = new Date();
	const currentTimeString = currentTime.toTimeString().slice(0, 5);

	return (
		<>
			<TopBar
				hideBackdrop
				hideSearchBar
				buttonHref={`/medibook/sessions/${sessionNumber}/programme`}
				buttonText={`Session ${romanize(selectedDay.session.numberInteger)} Days`}
				title={`${selectedDay.type === "CONFERENCE" ? "Conference" : "Workshop"} Day ${dayIndex} Programme`}>
				{isManagement && <SearchParamsButton searchParams={{ "create-day-event": selectedDay.id }}>Create New</SearchParamsButton>}
			</TopBar>
			<MainWrapper>
				<Table>
					<TableHead>
						<TableRow>
							{isManagement && (
								<TableHeader>
									<span className="sr-only">Actions</span>
								</TableHeader>
							)}
							<TableHeader>Name</TableHeader>
							<TableHeader>Start</TableHeader>
							<TableHeader>End</TableHeader>
							<TableHeader>Location</TableHeader>
							<TableHeader>Description</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{sortedEvents.map((dayEvent) => {
							const isCurrent = currentTimeString >= dayEvent.startTime && currentTimeString <= dayEvent.endTime;
							return (
								<TableRow className={cn(isCurrent ? "bg-zinc-200 font-bold! text-black!" : "")} key={dayEvent.id}>
									{isManagement && (
										<TableCell>
											<Dropdown>
												<DropdownButton plain aria-label="More options">
													<Ellipsis width={18} />
												</DropdownButton>
												<DropdownMenu anchor="bottom end">
													<SearchParamsDropDropdownItem searchParams={{ "edit-day-event": dayEvent.id }}>Edit</SearchParamsDropDropdownItem>
													<SearchParamsDropDropdownItem searchParams={{ "delete-day-event": dayEvent.id }}>Delete</SearchParamsDropDropdownItem>
												</DropdownMenu>
											</Dropdown>
										</TableCell>
									)}
									<TableCell>{dayEvent.name}</TableCell>
									<TableCell>{dayEvent.startTime}</TableCell>
									<TableCell>{dayEvent.endTime}</TableCell>
									<TableCell>{dayEvent.location}</TableCell>
									<TableCell>{dayEvent.description}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</MainWrapper>
		</>
	);
}
