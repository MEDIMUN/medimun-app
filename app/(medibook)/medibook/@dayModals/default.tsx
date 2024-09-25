import prisma from "@/prisma/client";
import { CreateDayModal, DeleteDayModal, EditDayModal } from "./modals";

export default async function Modals({ searchParams }) {
	const locations = await prisma.location.findMany();
	let selectedDay;

	if (searchParams?.["edit-day"]) selectedDay = await prisma.day.findUnique({ where: { id: searchParams?.["edit-day"] } });
	if (searchParams?.["delete-day"]) selectedDay = await prisma.day.findUnique({ where: { id: searchParams?.["delete-day"] } });

	return (
		<>
			<DeleteDayModal selectedDay={selectedDay} />
			<EditDayModal locations={locations} selectedDay={selectedDay} />
			<CreateDayModal locations={locations} />
		</>
	);
}
