"use client";

import { Label } from "@/components/ui/label";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { createSession } from "./create-session.server";
import { removeSearchParams } from "@/lib/searchParams";

export default function Drawer() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const { data: session, status } = useSession();
	const { toast } = useToast();

	async function createSessionReceiver(data) {
		const res = await createSession(data);
		if (res.ok) removeSearchParams(router, { add: "" });
		if (res) toast(res);
	}

	return (
		<Modal isOpen={searchParams.has("add") && status === "authenticated" && authorize(session, [s.admins, s.sd])} onOpenChange={() => removeSearchParams(router, { add: "" })}>
			<ModalContent>
				<ModalHeader>Add Session</ModalHeader>
				<ModalBody>
					<form action={createSessionReceiver} className="flex flex-col gap-4" id="main">
						<Input label="Session Number" isRequired type="number" min={1} name="sessionNumber" />
						<Input label="Theme" name="theme" />
						<Input label="Theme Secondary Phrase" name="phrase2" />
					</form>
				</ModalBody>
				<ModalFooter>
					<Button color="danger" variant="light" onPress={() => removeSearchParams(router, { add: "" })} form="main" type="submit">
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
