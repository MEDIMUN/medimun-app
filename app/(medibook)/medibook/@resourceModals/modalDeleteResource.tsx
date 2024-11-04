"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { Dropdown, DropdownButton, DropdownHeading, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { useFlushState } from "@/hooks/use-flush-state";
import { Select } from "@/components/select";
import { deleteResourceAction, editResourceDetails } from "./action";
import { toast } from "sonner";

export function ModalDeleteResource({ selectedResource }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useFlushState(false);

	function onClose() {
		removeSearchParams({ "delete-resource": "" }, router);
	}

	async function handleSubmit() {
		setIsLoading(true);
		toast.loading(`Deleting ${selectedResource}`, {
			id: "delete-resource",
		});
		const res = await deleteResourceAction(selectedResource.id);
		if (res?.ok) {
			toast.success(res?.message, {
				id: "delete-resource",
			});
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message, {
				id: "delete-resource",
			});
		}

		setIsLoading(false);
	}

	const isOpen = searchParams.has("delete-resource") && !!selectedResource;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Delete {selectedResource?.name}</DialogTitle>
			<Description>This action cannot be undone. The resource may be linked to announcements, events, and other resources.</Description>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color="red" disabled={isLoading} type="button" onClick={handleSubmit}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
