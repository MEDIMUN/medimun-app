"use client";

import { Button } from "@/components/ui/button";
import { useFlushState } from "@/hooks/use-flush-state";
import { useRouter } from "next/navigation";
import ReactConfetti from "react-confetti";
import { submitResolutionToChairs } from "../actions";
import { toast } from "sonner";
import { sendResolutionBackToCommittee } from "@/app/(medibook)/medibook/(session)/sessions/[sessionNumber]/approval-panel/@assignModals/actions";

export function SendBackToCommitteeButton({ resolutionId }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit() {
		if (isLoading || !resolutionId) return;
		setIsLoading(true);
		const res = await sendResolutionBackToCommittee({ resolutionId });
		if (res?.ok) {
			toast.success(res?.message);
			await new Promise((resolve) => setTimeout(resolve, 5000));
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	return (
		<>
			<Button disabled={isLoading} onClick={handleSubmit}>
				Send Resolution Back to Committee
			</Button>
		</>
	);
}
