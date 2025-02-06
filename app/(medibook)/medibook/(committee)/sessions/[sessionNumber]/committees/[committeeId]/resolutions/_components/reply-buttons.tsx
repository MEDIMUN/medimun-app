"use client";

import { Button } from "@/components/ui/button";
import { acceptCoSubmitterInvitation, rejectCoSubmitterInvitation } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ReplyButtons({ resolutionId }) {
	const router = useRouter();

	async function handleAccept() {
		const res = await acceptCoSubmitterInvitation(resolutionId);
		if (res?.ok) {
			toast.success(res?.message, {
				id: "delete-resource",
			});
			router.refresh();
		} else {
			toast.error(res?.message, {
				id: "delete-resource",
			});
		}
	}

	async function handleDecline() {
		const res = await rejectCoSubmitterInvitation(resolutionId);
		if (res?.ok) {
			toast.success(res?.message, {
				id: "delete-resource",
			});
			router.refresh();
		} else {
			toast.error(res?.message, {
				id: "delete-resource",
			});
		}
	}

	return (
		<div className="flex gap-4 w-full md:max-w-[150px] flex-row md:flex-col">
			<Button onClick={handleAccept} className="bg-green-600 w-full">
				Accept
			</Button>
			<Button onClick={handleDecline} className="w-full">
				Decline
			</Button>
		</div>
	);
}
