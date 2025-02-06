"use client";

import { Button } from "@/components/ui/button";
import { acceptCoSubmitterInvitation, rejectCoSubmitterInvitation } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { acceptAllianceInvitation, rejectAllianceInvitation } from "../@allianceModals/action";
import { useState } from "react";

export function ReplyAllianceButtons({ allianceId }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function handleAccept() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await acceptAllianceInvitation({ allianceId });
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
		setIsLoading(false);
	}

	async function handleDecline() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await rejectAllianceInvitation({ allianceId });

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
		setIsLoading(false);
	}

	return (
		<div className="flex gap-4 w-full md:max-w-[150px] flex-row md:flex-col">
			<Button disabled={isLoading} onClick={handleAccept} className="bg-green-600 w-full">
				Accept
			</Button>
			<Button disabled={isLoading} onClick={handleDecline} className="w-full">
				Decline
			</Button>
		</div>
	);
}
