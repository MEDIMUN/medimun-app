import prisma from "@/prisma/client";
import { CreateDayEventModal, DeleteDayEventModal, EditDayEventModal } from "./modals";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";

export default async function Modals(props) {
	const searchParams = await props.searchParams;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return null;

	if (searchParams?.["edit-day-event"]) {
		const selectedDayEvent = await prisma.dayEvent.findUnique({ where: { id: searchParams["edit-day-event"] } });
		if (!selectedDayEvent) return null;
		return <EditDayEventModal selectedDayEvent={selectedDayEvent} />;
	}

	if (searchParams?.["delete-day-event"]) {
		const selectedDayEvent = await prisma.dayEvent.findUnique({ where: { id: searchParams["delete-day-event"] } });
		if (!selectedDayEvent) return null;
		return <DeleteDayEventModal selectedDayEvent={selectedDayEvent} />;
	}

	if (searchParams?.["create-day-event"]) {
		const selectedDay = await prisma.day.findUnique({ where: { id: searchParams["create-day-event"] } });
		if (!selectedDay) return null;
		return <CreateDayEventModal selectedDay={selectedDay} />;
	}
}
