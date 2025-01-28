"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { removeSearchParams } from "@/lib/search-params";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogTitle } from "@/components/dialog";
import { Description } from "@/components/fieldset";
import { useFlushState } from "@/hooks/use-flush-state";
import { deleteResourceAction } from "./action";
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
