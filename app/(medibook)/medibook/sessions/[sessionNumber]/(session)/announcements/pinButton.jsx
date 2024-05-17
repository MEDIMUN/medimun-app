"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Textarea, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Input } from "@nextui-org/react";
import { removeSearchParams } from "@/lib/searchParams";
import formatDateForInput from "@/lib/formatDateForInput";
import { useEffect, useState } from "react";
import { pinAnnouncement } from "./create-announcement.server";
import prisma from "@/prisma/client";
import * as SolarIconSet from "solar-icon-set";

export default function PinButton({ announcementId, isPinned }) {
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	async function pinAnnouncementHandler() {
		setIsLoading(true);
		const res = await pinAnnouncement(announcementId);
		if (res) toast(res);
		if (res?.ok) {
			router.refresh();
		}
		setIsLoading(false);
	}
	return (
		<Button isLoading={isLoading} isDisabled={isLoading} onPress={pinAnnouncementHandler} isIconOnly>
			<SolarIconSet.Pin iconStyle="Outline" size={24} />
		</Button>
	);
}
