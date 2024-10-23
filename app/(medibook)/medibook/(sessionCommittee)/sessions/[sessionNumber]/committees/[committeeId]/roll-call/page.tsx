import prisma from "@/prisma/client";
import { DateSelector } from "./components/DateSelector";
import { notFound, redirect } from "next/navigation";
import RollCallTable from "./Table";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

export default async function Page(props) {
    const searchParams = await props.searchParams;
    const days = await prisma.day
		.findMany({
			orderBy: [{ type: "asc" }, { date: "asc" }],
			select: {
				id: true,
				date: true,
				type: true,
				name: true,
			},
		})
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

    const today = new Date();
    const currentDay = days.find((day) => day.date.toDateString() === today.toDateString()) || null;
    const currentDayId = currentDay?.id || null;

    function dayIdExists(dayId) {
		return days.some((day) => day.id === dayId);
	}

    if (searchParams.day) {
		const selectedDay = days.find((day) => day.id === searchParams.day);
		if (!selectedDay && !currentDayId) {
			redirect(`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/roll-call`);
		}
	}

    if (!searchParams.day && currentDayId) {
		redirect(`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/roll-call?day=${currentDayId}`);
	}

    let rollCalls, delegates;
    if (searchParams.day && dayIdExists(searchParams.day)) {
		rollCalls = await prisma.rollCall
			.findMany({
				where: {
					day: {
						id: searchParams.day,
					},
				},
				orderBy: {
					index: "asc",
				},
			})
			.catch(notFound);
		delegates = await prisma.delegate.findMany({
			where: {
				OR: [
					{
						committee: {
							id: searchParams.committeeId,
						},
					},
					{
						committee: {
							slug: searchParams.committeeId,
						},
					},
				],
			},
			include: {
				user: true,
			},
			orderBy: {
				country: "asc",
			},
		});
	}

    return (
		<div>
			<div className="flex w-full flex-col gap-3 rounded-xl bg-content1/60 p-4 shadow-sm md:flex-row">
				<div className="my-auto ml-1">Select Day</div>
				<DateSelector className="ml-auto md:max-w-[300px]" conferenceDays={conferenceDays} workshopDays={workshopDays} />
			</div>
			{rollCalls && (
				<ScrollShadow orientation="horizontal" className="mt-4 rounded-xl bg-content1">
					<RollCallTable rollCalls={rollCalls} />
				</ScrollShadow>
			)}
		</div>
	);
}
