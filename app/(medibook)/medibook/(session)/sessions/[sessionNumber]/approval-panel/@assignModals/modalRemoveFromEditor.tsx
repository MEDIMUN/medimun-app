"use client";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";
import { Prisma } from "@prisma/client";
import { toast } from "sonner";
import { assignResolutionToEditor, removeResolutionFromEditor } from "./actions";

type ApplicableDelegateType = Prisma.MemberGetPayload<{
	include: {
		user: true;
	};
}>;

type ResolutionType = Prisma.ResolutionGetPayload<{}>;

export function ModalRemoveFromEditor({ selectedResolution }: { selectedResolution: ResolutionType }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const res = await removeResolutionFromEditor({
			resolutionId: selectedResolution.id,
		});
		if (res?.ok) {
			toast.success(res?.message);
			onClose();
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	function onClose() {
		removeSearchParams({ "remove-from-editor": "" }, router);
	}

	const isOpen = searchParams && selectedResolution && searchParams.has("remove-from-editor");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Remove Resolution from Editor</DialogTitle>
			<DialogDescription>Are you sure you want to remove this resolution from the editor?</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button color={"red"} disabled={isLoading} type="submit" onClick={handleSubmit}>
					Remove
				</Button>
			</DialogActions>
		</Dialog>
	);
}
