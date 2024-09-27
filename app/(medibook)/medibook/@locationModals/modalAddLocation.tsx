"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useSearchParams, useRouter } from "next/navigation";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addLocation } from "./actions";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/useFlushState";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";

export function AddLocationModal() {
	const { data: session, status } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function createLocationHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await addLocation(formData);
		if (res?.ok) {
			onClose();
			updateSearchParams({ edit: res?.id }, router);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams.has("create-location") && status === "authenticated" && authorize(session, [s.management]);

	function onClose() {
		if (searchParams.has("return")) {
			router.push(searchParams.get("return"));
		}
		removeSearchParams({ "create-location": "", "edit-location": "delete-location" }, router);
	}

	return (
		<Dialog onClose={onClose} open={isOpen as boolean}>
			<DialogTitle>Add New Location</DialogTitle>
			<DialogDescription>Locations can be assigned to schools, conference days and events to provide address details.</DialogDescription>
			<DialogBody>
				{/*@ts-ignore Server Action*/}
				<form id="add" action={createLocationHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input required name="name" />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain disabled={isLoading} onClick={onClose}>
					Cancel
				</Button>
				<Button loading={isLoading} disabled={isLoading} type="submit" form="add">
					Next
				</Button>
			</DialogActions>
		</Dialog>
	);
}
