"use client";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";
import { Prisma } from "@prisma/client";
import { toast } from "sonner";
import { approveResolution, sendResolutionBackToCommittee } from "./actions";

type ApplicableDelegateType = Prisma.MemberGetPayload<{
	include: {
		user: true;
	};
}>;

type ResolutionType = Prisma.ResolutionGetPayload<{
	include: {
		topic: true;
		committee: {
			include: {
				Topic: true;
			};
		};
	};
}>;

export function ModalSendResolutionBackToCommittee({ selectedResolution }: { selectedResolution: ResolutionType }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	function onClose() {
		removeSearchParams({ "send-resolution-back-to-committee": "" });
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (isLoading) return;
		setIsLoading(true);
		const res = await sendResolutionBackToCommittee({
			resolutionId: selectedResolution.id,
		});
		if (res?.ok) {
			toast.success(res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.has("send-resolution-back-to-committee") && !!selectedResolution;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Send Approved Resolution Back to Committee</DialogTitle>
			<DialogDescription>
				Are you sure you want to send this approved resolution back to the committee? This action cannot be undone. You will still have access to the
				resolution but may not be able to edit it depending on your role.
			</DialogDescription>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color={"green"} type="submit" onClick={handleSubmit}>
					Send Back
				</Button>
			</DialogActions>
		</Dialog>
	);
}
