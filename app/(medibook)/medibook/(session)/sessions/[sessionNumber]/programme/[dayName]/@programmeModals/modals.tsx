"use client";

import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { removeSearchParams } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createDayEvent, deleteDayEvent, editDayEvent } from "./actions";
import { toast } from "sonner";
import { Day, DayEvent } from "@prisma/client";

export function CreateDayEventModal({ selectedDay }: { selectedDay: Day }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ "create-day-event": "" }, router);
	}

	async function handleSubmit(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		setIsLoading(true);
		formData.append("dayId", searchParams.get("create-day-event"));
		const res = await createDayEvent(formData);
		if (res?.ok) {
			toast.success(...res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && !!searchParams.get("create-day-event");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Add Day Event</DialogTitle>
			<DialogBody>
				<form onSubmit={handleSubmit} id="create-day-event" className="flex flex-col gap-6">
					<Field>
						<Label required>Start Time (24-hour)</Label>
						<Input disabled={isLoading} required name="startTime" type="time" />
					</Field>
					<Field>
						<Label required>End Time (24-hour)</Label>
						<Input disabled={isLoading} required name="endTime" type="time" />
					</Field>
					<Field>
						<Label required>Name</Label>
						<Input disabled={isLoading} name="name" type="text" />
					</Field>
					<Field>
						<Label optional>Description</Label>
						<Textarea disabled={isLoading} name="description" />
					</Field>
					<Field>
						<Label optional>Location</Label>
						<Textarea disabled={isLoading} name="location" />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} type="submit" form="create-day-event">
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function DeleteDayEventModal({ selectedDayEvent }: { selectedDayEvent: DayEvent }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ "delete-day": "" }, router);
	}

	async function handleDeleteDayEvent() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await deleteDayEvent(selectedDayEvent.id);
		if (res?.ok) {
			toast.success(...res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && !!searchParams.get("delete-day-event");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Delete {selectedDayEvent.name}</DialogTitle>
			<DialogDescription>Are you sure you want to delete this day?</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} onClick={handleDeleteDayEvent}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function EditDayEventModal({ selectedDayEvent }: { selectedDayEvent: DayEvent }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ "edit-day-event": "" }, router);
	}

	async function handleEditDayEvent(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		formData.append("id", selectedDayEvent.id);
		const res = await editDayEvent(formData);
		if (res?.ok) {
			toast.success(...res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && !!searchParams.get("edit-day-event");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Edit {selectedDayEvent.name}</DialogTitle>
			<DialogBody>
				<form action={handleEditDayEvent} id="edit-day-event" className="flex flex-col gap-6">
					<Field>
						<Label required>Start Time (24-hour)</Label>
						<Input disabled={isLoading} required name="startTime" type="time" defaultValue={selectedDayEvent.startTime} />
					</Field>
					<Field>
						<Label required>End Time (24-hour)</Label>
						<Input disabled={isLoading} required name="endTime" type="time" defaultValue={selectedDayEvent.endTime} />
					</Field>
					<Field>
						<Label required>Name</Label>
						<Input disabled={isLoading} required name="name" type="text" defaultValue={selectedDayEvent.name} />
					</Field>
					<Field>
						<Label optional>Description</Label>
						<Textarea disabled={isLoading} name="description" defaultValue={selectedDayEvent.description} />
					</Field>
					<Field>
						<Label optional>Location</Label>
						<Textarea disabled={isLoading} name="location" defaultValue={selectedDayEvent.location} />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} type="submit" form="edit-day-event">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}
