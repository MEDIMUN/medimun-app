"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Tabs, Tab } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { editSession } from "./actions";
import { currentSession } from "./actions";
import { removeSearchParams } from "@/lib/searchParams";

export default function Drawer(props) {
	const { data: session, status } = useSession();
	const [password, setPassword] = useState("");
	const [selectedTab, setSelectedTab] = useState("edit");
	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function editSessionReceiver(data) {
		data.append("sessionNumber", props.selectedSession.number);
		const res = await editSession(data);
		if (res) toast(res);
		if (res.ok) removeSearchParams({ edit: "" }, router);
	}

	async function currentSessionReceiver(data) {
		data.append("sessionNumber", props.selectedSession.number);
		const res = await currentSession(data);
		if (res) toast(res);
		if (res.ok) removeSearchParams({ edit: "" }, router);
	}

	return (
		<Modal isOpen={searchParams.get("edit") == "" && status === "authenticated" && authorize(session, [s.admins, s.sd, s.sec])} onOpenChange={() => router.push(`/medibook/sessions/${props.selectedSession.number}`)}>
			<ModalContent>
				<ModalHeader>Edit Session {props.selectedSession.number}</ModalHeader>
				<ModalBody>
					<Tabs onSelectionChange={setSelectedTab} selectedKey={selectedTab} aria-label="edit">
						<Tab key="edit" title="Edit Session Details">
							<form action={editSessionReceiver} id="main" className="flex flex-col gap-4">
								<Input label="Theme" size="lg" placeholder="e.g. Strengthening Sustainability" isRequired defaultValue={props.selectedSession.theme} name="theme" />
								<Input label="Theme Secondary Phrase" size="lg" placeholder="e.g. Enhancing Global Partnerships" isRequired defaultValue={props.selectedSession.phrase2} name="phrase2" />
							</form>
						</Tab>
						<Tab isDisabled={!(status === "authenticated" && authorize(session, [s.admins, s.sd]) && !props.selectedSession.isCurrent)} key="current" title="Set session as Current" className="flex flex-col gap-4">
							<form id="main" action={currentSessionReceiver}>
								<Input onValueChange={setPassword} value={password} label="Password" size="lg" isRequired name="password" type="password" />
							</form>
						</Tab>
					</Tabs>
				</ModalBody>
				<ModalFooter>
					<Button isDisabled={selectedTab == "current" && password.length < 8} color="primary" className="ml-auto" form="main" type="submit">
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
