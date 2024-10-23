"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { Dropdown, DropdownButton, DropdownHeading, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { useFlushState } from "@/hooks/useFlushState";
import { Select } from "@/components/select";
import { editResourceDetails } from "./action";
import { toast } from "sonner";

export function ModalEditResource({ selectedResource }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useFlushState(false);

	if (!selectedResource) return null;

	function onClose() {
		removeSearchParams({ "edit-resource": "" }, router);
	}

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		const res = await editResourceDetails(formData, selectedResource?.id);
		if (res?.ok) {
			toast.success(res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams.has("edit-resource") && !!selectedResource;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Edit Resource</DialogTitle>
			<DialogBody>
				{/* @ts-ignore Server Action */}
				<form action={handleSubmit} id="edit" className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input defaultValue={selectedResource?.name} disabled={isLoading} required name="name" maxLength={250} />
					</Field>

					<Field>
						<Label>File Privacy</Label>
						<Description>
							Private Files can only be viewed by the management. Public files can be viewed by the scope the file is shared in.
						</Description>
						<Select disabled={isLoading} name="isPrivate" defaultValue={selectedResource?.isPrivate ? "true" : "false"}>
							<option value="false">Public</option>
							<option value="true">Private</option>
						</Select>
					</Field>

					<Field>
						<Label>Pin Resource</Label>
						<Description>Pinned resources will be shown at the top of the resource list.</Description>
						<Select disabled={isLoading} name="isPinned" defaultValue={selectedResource?.isPinned ? "true" : "false"}>
							<option value="false">Not Pinned</option>
							<option value="true">Pinned</option>
						</Select>
					</Field>

					<Field>
						<Label>Share Anonymously</Label>
						<Description>
							Anonymously shared files will not show the uploader&apos;s name. Management members can still see the uploader&apos;s name.
						</Description>
						<Select disabled={isLoading} name="isAnonymous" defaultValue={selectedResource?.isAnonymous ? "true" : "false"}>
							<option value="false">Not Anonymous</option>
							<option value="true">Anonymous</option>
						</Select>
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button disabled={isLoading} type="submit" form="edit">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}
