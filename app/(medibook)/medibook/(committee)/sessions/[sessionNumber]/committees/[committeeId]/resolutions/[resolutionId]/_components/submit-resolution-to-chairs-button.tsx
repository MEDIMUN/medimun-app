"use client";

import { Button } from "@/components/ui/button";
import { useFlushState } from "@/hooks/use-flush-state";
import { useRouter } from "next/navigation";
import ReactConfetti from "react-confetti";
import { submitResolutionToChairs } from "../actions";
import { toast } from "sonner";

export function SubmitResolutionToChairsButton({ resolutionId }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useFlushState(false);
	const [isSubmitted, setIsSubmitted] = useFlushState(false);

	async function handleSubmit() {
		if (isLoading || !resolutionId) return;
		setIsLoading(true);
		const res = await submitResolutionToChairs(resolutionId);
		if (res?.ok) {
			setIsSubmitted(true);
			toast.success(res?.message);
			await new Promise((resolve) => setTimeout(resolve, 5000));
			router.refresh();
		} else {
			toast.error(res?.message);
		}
	}

	return (
		<>
			{isSubmitted && <ReactConfetti />}
			<Button disabled={isLoading || isSubmitted} onClick={handleSubmit}>
				Submit Resolution to Chairs
			</Button>
		</>
	);
}
