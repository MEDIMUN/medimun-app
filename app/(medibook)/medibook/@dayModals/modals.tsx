"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import { Select } from "@/components/select";
import { Textarea } from "@/components/textarea";
import { authorize, s } from "@/lib/authorize";
import { removeSearchParams } from "@/lib/searchParams";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createDay, deleteDay, editDay } from "./actions";
import { toast } from "sonner";

export function EditDayModal({ locations, selectedDay }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ "edit-day": "", "create-day": "" }, router);
	}

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		formData.append("id", searchParams.get("edit-day"));
		const res = await editDay(formData);
		if (res?.ok) {
			toast.success(...res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isOpen =
		!!searchParams.get("edit-day") && status === "authenticated" && authorize(authSession, [s.admins, s.sd, s.director]) && !!selectedDay;

	if (!isOpen) return;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Add Day</DialogTitle>
			<DialogBody action={handleSubmit} id="edit-day" as="form" className="flex flex-col gap-6">
				<Field>
					<Label>
						Date <Badge color="red">Required</Badge>
					</Label>
					<Input defaultValue={selectedDay?.date?.toISOString()?.split("T")?.[0]} disabled={isLoading} required name="date" type="date" />
				</Field>
				<Field>
					<Label>
						Type <Badge color="red">Required</Badge>
					</Label>
					<Select disabled={isLoading} name="type" required defaultValue={selectedDay?.type}>
						<option value="CONFERENCE">Conference</option>
						<option value="WORKSHOP">Workshop</option>
						<option value="EVENT">Event</option>
					</Select>
				</Field>
				<Field>
					<Label>
						Location <Badge color="yellow">Optional</Badge>
					</Label>
					<Description>
						<Link
							href="/medibook/locations?create-location=true&return=/medibook/sessions/${params.sessionNumber}/programme"
							className="text-primary">
							Add Location
						</Link>
					</Description>
					<Select disabled={isLoading} name="locationId" defaultValue={selectedDay?.locationId}>
						<option value="null">None</option>
						{locations.map((location) => (
							<option key={location.id} value={location.id}>
								{location.name}
							</option>
						))}
					</Select>
				</Field>
				<Field>
					<Label>
						Name <Badge color="yellow">Optional</Badge>
					</Label>
					<Input defaultValue={selectedDay.name} disabled={isLoading} name="name" type="text" />
				</Field>
				<Field>
					<Label>
						Description <Badge color="yellow">Optional</Badge>
					</Label>
					<Textarea defaultValue={selectedDay.description} disabled={isLoading} name="description" />
				</Field>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} type="submit" form="edit-day">
					Update
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function CreateDayModal({ locations }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ "create-day": "" }, router);
	}

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		formData.append("sessionId", searchParams.get("create-day"));
		const res = await createDay(formData);
		if (res?.ok) {
			toast.success(...res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = !!searchParams.get("create-day") && status === "authenticated" && authorize(authSession, [s.sd, s.director, s.admins]);

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Add Day</DialogTitle>
			<DialogBody action={handleSubmit} id="create-day" as="form" className="flex flex-col gap-6">
				<Field>
					<Label>
						Date <Badge color="red">Required</Badge>
					</Label>
					<Input disabled={isLoading} required name="date" type="date" />
				</Field>
				<Field>
					<Label>
						Type <Badge color="red">Required</Badge>
					</Label>
					<Select disabled={isLoading} name="type" required defaultValue="CONFERENCE">
						<option value="CONFERENCE">Conference</option>
						<option value="WORKSHOP">Workshop</option>
						<option value="EVENT">Event</option>
					</Select>
				</Field>
				<Field>
					<Label>
						Location <Badge color="yellow">Optional</Badge>
					</Label>
					<Description>
						<Link
							href="/medibook/locations?create-location=true&return=/medibook/sessions/${params.sessionNumber}/programme"
							className="text-primary">
							Add Location
						</Link>
					</Description>
					<Select disabled={isLoading} name="locationId" defaultValue="null">
						<option value="null">None</option>
						{locations.map((location) => (
							<option key={location.id} value={location.id}>
								{location.name}
							</option>
						))}
					</Select>
				</Field>
				<Field>
					<Label>
						Name <Badge color="yellow">Optional</Badge>
					</Label>
					<Input disabled={isLoading} name="name" type="text" />
				</Field>
				<Field>
					<Label>
						Description <Badge color="yellow">Optional</Badge>
					</Label>
					<Textarea disabled={isLoading} name="description" />
				</Field>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} type="submit" form="create-day">
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function DeleteDayModal({ selectedDay }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ "create-day": "" }, router);
	}

	async function handleSubmit() {
		setIsLoading(true);
		const res = await deleteDay(selectedDay.id);
		if (res?.ok) {
			toast.success(...res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isOpen =
		!!searchParams.get("delete-day") && status === "authenticated" && authorize(authSession, [s.sd, s.director, s.admins]) && !!selectedDay;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Delete Day</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete this day? This will delete all events, roll-calls and morning registerations associated with this day.
			</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button onClick={handleSubmit} color="red" disabled={isLoading}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
