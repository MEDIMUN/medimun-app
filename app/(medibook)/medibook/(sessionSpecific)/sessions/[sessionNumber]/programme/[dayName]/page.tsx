import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";

export default async function SpecificDaySchedulePage(props) {
	const dayName = (await props?.params)?.dayName;
	const sessionNumber = (await props?.params)?.sessionNumber;
	let friendlyDayName = "";
	//conference-day-n or workshop-day-n
	const dayNameLower = dayName.toUpperCase();
	const dayNameParts = dayNameLower.split("-");

	const dayType = dayNameParts[0];
	const dayIndex = parseInt(dayNameParts[2]);

	console.log({ dayType, dayIndex });

	const selectedDayPrisma = await prisma.day.findMany({
		where: {
			session: {
				number: sessionNumber,
			},
			type: dayType,
		},
		skip: dayIndex - 1,
		take: 1,
		include: {
			DayEvent: true,
			session: true,
		},
	});

	const selectedDay = selectedDayPrisma[0];

	const sortedEvents = selectedDay.DayEvent.sort((a, b) => parseInt(a.startTime.replace(":", "")) - parseInt(b.startTime.replace(":", "")));

	const currentTime = new Date();
	const currentTimeString = currentTime.toTimeString().slice(0, 5); // Extract HH:mm

	return (
		<>
			<TopBar
				hideBackdrop
				hideSearchBar
				buttonHref={`/medibook/sessions/${sessionNumber}/programme`}
				buttonText={`Session ${romanize(selectedDay.session.number)} Days`}
				title={
					<>
						{selectedDay.type === "CONFERENCE" ? "Conference" : "Workshop"} Day {dayIndex} Programme
					</>
				}></TopBar>
			<ol className="divide-y divide-gray-200 text-sm/6 text-gray-500">
				{sortedEvents.map((event) => {
					const isCurrent = currentTimeString >= event.startTime && currentTimeString <= event.endTime;

					return (
						<li key={event.id} className={`py-4 sm:flex p-2 ${isCurrent ? "bg-zinc-200 !font-bold" : ""}`}>
							<time dateTime="2022-01-17" className="min-w-28 flex-none">
								{event.name}
							</time>
							<p className="mt-2 flex-auto font-semibold text-gray-900 sm:mt-0">{event.description}</p>
							<p className="flex-none sm:ml-6">
								<time dateTime="2022-01-13T14:30">{event.startTime}</time> - <time dateTime="2022-01-13T16:30">{event.endTime}</time>
							</p>
						</li>
					);
				})}
			</ol>
		</>
	);
}
