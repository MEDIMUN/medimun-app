"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { removeSearchParams } from "@/lib/search-params";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogTitle } from "@/components/dialog";
import { Description } from "@/components/fieldset";
import { useFlushState } from "@/hooks/use-flush-state";
import { deleteResolution, sendResolutionToApproval } from "./action";
import { toast } from "sonner";
import { Resolution } from "@prisma/client";

export function ModalSendToApprovalPanel({ selectedResolution }: { selectedResolution: Resolution }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useFlushState(false);

	function onClose() {
		removeSearchParams({ "send-resolution-to-approval": "" }, router);
	}

	async function handleSubmit() {
		setIsLoading(true);
		toast.loading(`Sending ${selectedResolution.title} to approval panel`, {
			id: "send-to-approval-panel",
		});
		const res = await sendResolutionToApproval(selectedResolution.id);
		if (res?.ok) {
			toast.success(res?.message, {
				id: "send-to-approval-panel",
			});
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message, {
				id: "send-to-approval-panel",
			});
		}

		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.has("send-resolution-to-approval") && !!selectedResolution;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Send Resolution {selectedResolution.title} to Approval Panel?</DialogTitle>
			<Description>You can&apos;t edit this resolution until it has been approved by the approval panel.</Description>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color="red" disabled={isLoading} type="button" onClick={handleSubmit}>
					Send
				</Button>
			</DialogActions>
		</Dialog>
	);
}
