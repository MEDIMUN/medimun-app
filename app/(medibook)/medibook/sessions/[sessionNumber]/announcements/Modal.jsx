"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { Textarea, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Input } from "@nextui-org/react";
import { removeSearchParams } from "@/lib/searchParams";
import { useState } from "react";
import { createSessionAnnouncement, deleteSessionAnnouncement } from "./create-announcement.server";

export default function Drawer({ edit, selectedSession }) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [privacy, setPrivacy] = useState(edit?.privacy || "NORMAL");
	const searchParams = useSearchParams();
	const { toast } = useToast();

	async function createAnnouncementHandler(formData) {
		formData.append("selectedSession", selectedSession);
		formData.append("editId", edit?.id);
		formData.append("privacy", privacy);
		const res = await createSessionAnnouncement(formData);
		if (res) toast(res);
		if (res?.ok) {
			removeSearchParams(router, { add: "", edit: "", delete: "" });
			router.refresh();
		}
	}

	return (
		<Modal
			onOpenChange={() => {
				removeSearchParams(router, { add: "", edit: "", delete: "", view: "" });
				router.refresh();
			}}
			isOpen={(searchParams.has("add") || searchParams.has("edit")) && status === "authenticated" && authorize(session, [s.management])}>
			<ModalContent>
				<ModalHeader>Create Announcement</ModalHeader>
				<ModalBody>
					<form action={createAnnouncementHandler} id="main" name="main" className="flex flex-col gap-4">
						<Input defaultValue={edit?.title} isRequired label="Title" size="lg" name="title" />
						<Input defaultValue={edit?.description} label="Description" size="lg" name="description" />
						<Select defaultSelectedKeys={[edit?.privacy || "NORMAL"]} onChange={(e) => setPrivacy(e.target.value)} isRequired size="lg" label="Privacy">
							<SelectItem key="ANONYMOUS">Anonymous</SelectItem>
							<SelectItem key="BOARD">Board</SelectItem>
							<SelectItem key="SECRETARIAT">Secretariat</SelectItem>
							<SelectItem key="NORMAL">Normal</SelectItem>
						</Select>
						<Textarea defaultValue={edit?.markdown} isRequired label="Markdown" size="lg" name="markdown" />
					</form>
				</ModalBody>
				<ModalFooter>
					<Button type="submit" size="lg" form="main">
						Create
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export function DeleteModal() {
	const { data: session, status } = useSession();

	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	async function deleteSessionAnnouncementHandler() {
		const res = await deleteSessionAnnouncement(searchParams.get("delete"));
		if (res) toast(res);
		if (res.ok) {
			removeSearchParams(router, { add: "", edit: "", delete: "" });
			router.refresh();
		}
	}

	return (
		<Modal
			scrollBehavior="inside"
			isOpen={searchParams.has("delete") && status === "authenticated" && authorize(session, [s.admins, s.sd])}
			onOpenChange={() => {
				removeSearchParams(router, { add: "", edit: "", delete: "" });
				router.refresh();
			}}>
			<ModalContent>
				<ModalHeader>Are you sure?</ModalHeader>
				<ModalBody>This action will delete the announcement permamently.</ModalBody>
				<ModalFooter>
					<Button onPress={deleteSessionAnnouncementHandler} color="danger" form="main" type="submit">
						Delete
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
