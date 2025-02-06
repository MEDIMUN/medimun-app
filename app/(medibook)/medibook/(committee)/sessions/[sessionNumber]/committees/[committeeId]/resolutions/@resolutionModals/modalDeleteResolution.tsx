"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { removeSearchParams } from "@/lib/search-params";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogTitle } from "@/components/dialog";
import { Description } from "@/components/fieldset";
import { useFlushState } from "@/hooks/use-flush-state";
import { deleteResolution } from "./action";
import { toast } from "sonner";
import { Resolution } from "@prisma/client";

export function ModalDeleteResolution({ selectedResolution }: { selectedResolution: Resolution }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useFlushState(false);

	function onClose() {
		removeSearchParams({ "delete-committee-resolution": "" }, router);
	}

	async function handleSubmit() {
		setIsLoading(true);
		toast.loading(`Deleting ${selectedResolution.title}`, {
			id: "delete-resource",
		});
		const res = await deleteResolution(selectedResolution.id);
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

	const isOpen = searchParams && searchParams.has("delete-committee-resolution") && !!selectedResolution;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Delete Resolution {selectedResolution.title}?</DialogTitle>
			<Description>This action cannot be undone. The resolution will be deleted for you and all of your co-submitters.</Description>
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
