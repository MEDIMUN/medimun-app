"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { removeSearchParams } from "@/lib/searchParams";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogTitle } from "@/components/dialog";
import { Description } from "@/components/fieldset";
import { useFlushState } from "@/hooks/useFlushState";
import { deleteAnnouncementAction } from "./actions";
import { toast } from "sonner";

export function ModalDeleteAnnouncement({ selectedAnnouncement }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useFlushState(false);

	function onClose() {
		removeSearchParams({ "delete-announcement": "" }, router);
		router.refresh();
	}

	async function handleSubmit() {
		setIsLoading(true);
		toast.loading(`Deleting ${selectedAnnouncement.id}`, {
			id: "delete-announcement",
		});
		const res = await deleteAnnouncementAction(selectedAnnouncement.id);
		if (res?.ok) {
			toast.success(res?.message, {
				id: "delete-announcement",
			});
			onClose();
		} else {
			toast.error(res?.message, {
				id: "delete-announcement",
			});
		}
		setIsLoading(false);
	}

	const isOpen = searchParams.has("delete-announcement") && !!selectedAnnouncement;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Delete {selectedAnnouncement?.title}</DialogTitle>
			<Description>This action cannot be undone. Any previously shared announcement links will be invalidated.</Description>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button loading={isLoading} color="red" disabled={isLoading} type="button" onClick={handleSubmit}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
