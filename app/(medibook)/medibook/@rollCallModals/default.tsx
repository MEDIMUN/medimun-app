import prisma from "@/prisma/client";
import { CreateRollCallModal, DeleteRollCallModal, EditRollCallModal } from "./modals";

export default async function RollCallModals(props) {
	const searchParams = await props.searchParams;
	let selectedRollCall, selectedDay;
	if (searchParams?.["edit-roll-call"]) selectedRollCall = await prisma.rollCall.findUnique({ where: { id: searchParams?.["edit-roll-call"] } });
	if (searchParams?.["delete-roll-call"]) selectedRollCall = await prisma.rollCall.findUnique({ where: { id: searchParams?.["delete-roll-call"] } });
	if (searchParams?.["create-roll-call"]) selectedDay = await prisma.day.findUnique({ where: { id: searchParams?.["create-roll-call"] } });

	return (
		<>
			{selectedDay && <CreateRollCallModal selectedDay={selectedDay} />}
			{selectedRollCall && <EditRollCallModal selectedRollCall={selectedRollCall} />}
			{selectedRollCall && <DeleteRollCallModal selectedRollCall={selectedRollCall} />}
		</>
	);
}
