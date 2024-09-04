import { DateSelector } from "./components/DateSelector";
import prisma from "@/prisma/client";
import { notFound, redirect } from "next/navigation";
import { DeleteModal, RollCallModal } from "./modals";
import { DeleteButton, EditButton, MoveDownButton, MoveUpButton } from "./buttons";
import { Chip } from "@nextui-org/chip";
import { CardsTable, TableCard, TableCardBody, TableCardChip, TableCardFooter, TableCardHeader } from "@/components/medibook/table";

export default async function Page({ params, searchParams }) {
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
			redirect(`/medibook/sessions/${params.sessionNumber}/roll-calls`);
		}
	}

	if (!searchParams.day && currentDayId) {
		redirect(`/medibook/sessions/${params.sessionNumber}/roll-calls?day=${currentDayId}`);
	}

	let edit = null;
	if (searchParams.edit) {
		edit = await prisma.rollCall.findFirst({ where: { id: searchParams.edit || "" } }).catch(notFound);
	}

	let rollCalls;
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
				include: {
					day: true,
				},
			})
			.catch(notFound);
	}

	return (
		<CardsTable
			emptyTitle="No Roll Calls Registered"
			emptyDescription="Check out other sessions"
			emptyHref="/medibook/sessions"
			/* modals={[<RollCallModal edit={edit} conferenceDays={conferenceDays} workshopDays={workshopDays} />, <DeleteModal />]} */
		>
			<TableCardHeader>
				<div className="flex w-full flex-col gap-3 rounded-xl bg-content1/60 p-4 md:flex-row">
					<div className="my-auto ml-1">Select Day</div>
					<DateSelector className="ml-auto md:max-w-[300px]" conferenceDays={conferenceDays} workshopDays={workshopDays} />
				</div>
			</TableCardHeader>
			{!!rollCalls?.length &&
				rollCalls.map((rc, index: number) => {
					return (
						<TableCard
							hideBorder={index == rollCalls.length - 1}
							title={
								<>
									<p className="line-clamp-2 capitalize">{rc.name || rc?.day?.date.toLocaleString().slice(0, 10)}</p>
									{rc.day.date == "" && (
										<Chip className="mt-[6px] max-h-[18px] rounded-md bg-primary/90 px-0 text-xs font-medium text-white dark:border-white/20 md:my-auto">
											Today
										</Chip>
									)}
								</>
							}
							key={index}>
							<TableCardBody>
								<TableCardChip>Roll Call {rc.index + 1}</TableCardChip>
							</TableCardBody>
							<TableCardFooter>
								<MoveDownButton isDisabled={index == rollCalls.length - 1} rcId={rc.id} />
								<MoveUpButton isDisabled={index == 0} rcId={rc.id} />
								<EditButton rcId={rc.id} />
								<DeleteButton rcId={rc.id} />
							</TableCardFooter>
						</TableCard>
					);
				})}
		</CardsTable>
	);
}
