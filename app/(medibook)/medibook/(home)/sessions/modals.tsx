"use client";

import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { createSession } from "./actions";
import { removeSearchParams } from "@/lib/searchParams";
import { toast } from "sonner";
import { drawerProps } from "@/constants";

export default function Drawer() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();

	async function createSessionReceiver(data) {
		const res = await createSession(data);
		if (res?.ok) {
			toast.success(res?.message);
			removeSearchParams({ add: "" }, router);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
	}

	const isOpen = searchParams.has("add") && status === "authenticated" && authorize(session, [s.admins, s.sd]);

	return (
		<Modal {...drawerProps} isOpen={isOpen} onOpenChange={() => removeSearchParams({ add: "" }, router)}>
			<ModalContent>
				<ModalHeader>Add Session</ModalHeader>
				<ModalBody as="form" action={createSessionReceiver} id="main">
					<Input size="lg" label="Session Number" isRequired type="number" min={1} name="sessionNumber" />
					<Input size="lg" label="Theme" name="theme" />
					<Input size="lg" label="Theme Secondary Phrase" name="phrase2" />
				</ModalBody>
				<ModalFooter>
					<Button color="danger" variant="light" onPress={() => removeSearchParams({ add: "" }, router)}>
						Cancel
					</Button>
					<Button form="main" type="submit">
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
