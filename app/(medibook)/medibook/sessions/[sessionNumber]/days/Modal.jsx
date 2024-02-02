"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addDay, deleteDay } from "./add-day.server";
import { Input, Textarea, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem } from "@nextui-org/react";
import { removeSearchParams } from "@/lib/searchParams";
import formatDateForInput from "@/lib/formatDateForInput";
import { useState } from "react";

export default function Drawer({ selectedSession, locations, edit }) {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/medibook/signout");
	const [location, setLocation] = useState(edit?.location?.id);

	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function addDayHandler(formData) {
		formData.append("sessionNumber", selectedSession);
		formData.append("date", new Date(formData.get("date")).toISOString());
		formData.append("editId", edit?.id || "");
		formData.append("locationId", location);
		const res = await addDay(formData);
		if (res) toast(res);
		if (res.ok) {
			removeSearchParams(router, { add: "", edit: "", delete: "" });
			router.refresh();
		}
	}

	return (
		<Modal
			scrollBehavior="inside"
			isOpen={(searchParams.has("add") || searchParams.has("edit")) && status === "authenticated" && authorize(session, [s.admins, s.sd])}
			onOpenChange={() => {
				removeSearchParams(router, { add: "", edit: "", delete: "" });
				router.refresh();
			}}>
			<ModalContent>
				<ModalHeader>Add Conference or Workshop Day</ModalHeader>
				<ModalBody>
					<form action={addDayHandler} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
						<Input size="lg" defaultValue={formatDateForInput(edit?.date)} placeholder=" " isRequired type="date" label="Date" name="date" />
						<Select name="type" defaultSelectedKeys={[edit?.type]} isRequired size="lg" label="Day Type">
							<SelectItem key="CONFERENCE">Conference Day</SelectItem>
							<SelectItem key="WORKSHOP">Workshop Day</SelectItem>
						</Select>
						<Select disallowEmptySelection onChange={(e) => setLocation(e.target.value)} defaultSelectedKeys={[edit?.location?.id || "undefined"]} items={locations} size="lg" label="Location">
							<SelectItem key="undefined">None</SelectItem>
							{locations.map((location) => (
								<SelectItem key={location.id}>{location.name}</SelectItem>
							))}
						</Select>
						<Input defaultValue={edit?.name} label="Name" size="lg" maxLength={32} name="name" />
						<Textarea defaultValue={edit?.description} size="lg" maxLength={32} label="Description" name="description" />
					</form>
				</ModalBody>
				<ModalFooter>
					<Button form="main" type="submit">
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export function DeleteModal() {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/medibook/signout");

	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	async function deleteDayHandler() {
		const res = await deleteDay(searchParams.get("delete"));
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
				<ModalBody>This action will delete the day with all roll calls and events associated with it.</ModalBody>
				<ModalFooter>
					<Button onPress={deleteDayHandler} color="danger" form="main" type="submit">
						Delete
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
