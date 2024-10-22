"use client";

import { useSearchParams } from "next/navigation";
import { createRollCall, deleteRollCall, editRollCall } from "./actions";
import { useState } from "react";
import { toast } from "sonner";
import { flushSync as flush } from "react-dom";
import { removeSearchParams } from "@/lib/searchParams";
import { useRouter } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Badge } from "@/components/badge";

export function EditRollCallModal({ selectedRollCall }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ ["edit-roll-call"]: "" }, router);
	}

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		const res = await editRollCall(formData, selectedRollCall.id);
		if (res?.ok) {
			toast.success(...res?.message);
			onClose();
		} else {
			toast.error(...res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	const isOpen = !!searchParams.get("edit-roll-call") && status === "authenticated" && authorize(authSession, [s.management]);
	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Edit Roll Call</DialogTitle>
			<DialogBody as="form" id="edit-roll-call" action={handleSubmit}>
				<Field>
					<Label>Name</Label>
					<Input maxLength={20} name="name" defaultValue={selectedRollCall.name} />
				</Field>
			</DialogBody>
			<DialogActions>
				<Button onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} type="submit" form="edit-roll-call">
					Update
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function CreateRollCallModal({ selectedDay }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ ["create-roll-call"]: "" }, router);
	}

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		const res = await createRollCall(formData, selectedDay.id);
		if (res?.ok) {
			toast.success(...res?.message);
			onClose();
		} else {
			toast.error(...res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	const isOpen = !!searchParams.get("create-roll-call") && status === "authenticated" && authorize(authSession, [s.management]);
	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Add Roll Call</DialogTitle>
			<DialogBody as="form" id="create-roll-call" action={handleSubmit}>
				<Field>
					<Label>Name</Label>
					<Input maxLength={20} name="name" />
				</Field>
			</DialogBody>
			<DialogActions>
				<Button onClick={onClose} disabled={isLoading} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} loading={isLoading} type="submit" form="create-roll-call">
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function DeleteRollCallModal({ selectedRollCall }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ "delete-roll-call": "" }, router);
	}

	async function handleSubmit() {
		setIsLoading(true);
		const res = await deleteRollCall(selectedRollCall.id);
		if (res?.ok) {
			toast.success(res?.message);
			removeSearchParams({ "delete-roll-call": "" }, router);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	const isOpen = searchParams.get("delete-roll-call") && !!selectedRollCall && status === "authenticated" && authorize(authSession, [s.management]);
	if (!isOpen) return null;

	return (
		<Dialog title="Delete Roll Call" open={isOpen} onClose={onClose}>
			<DialogTitle>Delete Roll Call</DialogTitle>
			<DialogDescription>Are you sure you want to delete this roll call?</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button loading={isLoading} disabled={isLoading} color="red" onClick={handleSubmit}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
