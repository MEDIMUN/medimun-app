"use client";

import { useRouter } from "next/navigation";
import { pinAnnouncement } from "./pin-announcement.server";
import { Button } from "@nextui-org/react";
import { useState } from "react";

export default function PinButton({ announcementId, isPinned }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	async function pinAnnouncementWrapper(e) {
		setIsLoading(true);
		const res = await pinAnnouncement(announcementId);
		if (res?.ok) {
			router.refresh();
			setIsLoading(false);
		}
	}
	return (
		<Button isDisabled={isLoading} isLoading={isLoading} onPress={pinAnnouncementWrapper} className="ml-auto">
			{isPinned ? "Unpin" : "Pin"}
		</Button>
	);
}
