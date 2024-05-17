"use client";

import { getOrdinal } from "@/lib/get-ordinal";
import { romanize } from "@/lib/romanize";
import { useToast } from "@/components/ui/use-toast";
import { Modal, ModalContent, AvatarGroup, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Input, Button, ButtonGroup } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { updateSession, addRollCall } from "./update-session.server";
import { Spacer } from "@nextui-org/react";

export function SettingsForm({ selectedSession }) {
	const { toast } = useToast();
	const router = useRouter();

	async function updateSessionHandler(formData) {
		formData.append("sessionId", selectedSession.id);
		const res = await updateSession(formData);
		if (res) toast(res);
		if (res.ok) {
			router.refresh();
		}
	}

	async function addRollCallHandler(formData) {
		formData.append("sessionId", selectedSession.id);
		const res = await addRollCall(formData);
		if (res) toast(res);
		if (res.ok) {
			router.refresh();
		}
	}

	return (
		<>
			<form action={updateSessionHandler} className="flex flex-col gap-2">
				<Input size="lg" label="Theme" name="theme" isRequired defaultValue={selectedSession.theme} />
				<Input size="lg" label="Subtheme" name="phrase2" defaultValue={selectedSession.phrase2} />
				<Button type="submit">Save</Button>
			</form>
			<Spacer y={4} />
			<form action={addRollCallHandler} className="flex flex-row gap-2">
				<Input size="lg" label="Roll Call Name" />
				<Button className="h-auto" size="lg">
					Add
				</Button>
			</form>
		</>
	);
}
