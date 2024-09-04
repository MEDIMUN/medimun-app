//"use client";
//
//import { redirect, useSearchParams } from "next/navigation";
//import { useRouter } from "next/navigation";
//import { useToast } from "@/components/ui/use-toast";
//import { s, authorize } from "@/lib/authorize";
//import { useSession } from "next-auth/react";
//import { addDay, deleteDay } from "./actions";
///* import {
//	Input,
//	Textarea,
//	Modal,
//	ModalContent,
//	ModalHeader,
//	ModalBody,
//	ModalFooter,
//	Select,
//	SelectItem,
//	DatePicker,
//	Autocomplete,
//	AutocompleteItem,
//} from "@nextui-org/react"; */
//import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
//import formatDateForInput from "@/lib/formatDateForInput";
//import { useState } from "react";
//import { parseDate } from "@internationalized/date";
//import { Button } from "@/components/button";
//import { Dialog, DialogActions, DialogBody, DialogTitle } from "@/components/dialog";
//
//export default function AddModal({ selectedSession, locations, edit }) {
//	const { data: session, status } = useSession();
//	const { toast } = useToast();
//	const searchParams = useSearchParams();
//	const router = useRouter();
//	const [locationId, setLocationId] = useState(edit?.location?.id);
//
//	async function addDayHandler(formData) {
//		formData.append("sessionId", selectedSession.id);
//		formData.append("locationId", locationId);
//
//		if (edit?.id) {
//			formData.append("id", edit?.id);
//		}
//
//		const res = await addDay(formData);
//		if (res) toast(res);
//		if (res?.ok) {
//			removeSearchParams({ add: "", edit: "", delete: "" }, router);
//			router.refresh();
//		}
//	}
//
//	if (!(searchParams.has("edit") || searchParams.has("add"))) return;
//
//	return (
//		<Dialog
//			open={(searchParams.has("add") || searchParams.has("edit")) && status === "authenticated" && authorize(session, [s.management])}
//			onClose={() => {
//				removeSearchParams({ add: "", edit: "", delete: "" }, router);
//				router.refresh();
//			}}>
//				<DialogTitle>Add Day to Session</DialogTit>
//				<DialogBody as="form" action={addDayHandler} id="main">
//					<DatePicker
//						name="date"
//						showMonthAndYearPickers
//						size="lg"
//						defaultValue={edit?.date && parseDate(formatDateForInput(edit?.date))}
//						isRequired
//						label="Date"
//					/>
//					<Select name="type" defaultSelectedKeys={[edit?.type]} isRequired size="lg" label="Day Type">
//						<SelectItem key="CONFERENCE">Conference Day</SelectItem>
//						<SelectItem key="WORKSHOP">Workshop Day</SelectItem>
//					</Select>
//					<Autocomplete defaultItems={locations} onSelectionChange={setLocationId} defaultSelectedKey={edit?.location?.id} size="lg" label="Location">
//						{(location) => <AutocompleteItem key={location?.id}>{location?.name}</AutocompleteItem>}
//					</Autocomplete>
//					<Input defaultValue={edit?.name} label="Name" size="lg" maxLength={32} name="name" />
//					<Textarea defaultValue={edit?.description} size="lg" maxLength={32} label="Description" name="description" />
//				</DialogBo>
//				<DialogActions>
//					<Button onClick={() => removeSearchParams({ add: "", edit: "", delete: "" }, router)} variant="light">
//						Cancel
//					</Button>
//					<Button onClick={() => updateSearchParams({ delete: edit?.id }, router)}>Delete</Button>
//					<Button form="main" type="submit">
//						Save
//					</Button>
//				</DialogActions>
//		</Dialog>
//	);
//}
//
//export function DeleteModal() {
//	const { data: session, status } = useSession();
//
//	const router = useRouter();
//	const { toast } = useToast();
//	const searchParams = useSearchParams();
//
//	async function deleteDayHandler() {
//		const res = await deleteDay(searchParams.get("delete"));
//		if (res) toast(res);
//		if (res.ok) {
//			removeSearchParams({ add: "", edit: "", delete: "" }, router);
//			router.refresh();
//		}
//	}
//
//	return (
//		<Modal
//			isOpen={searchParams.has("delete") && status === "authenticated" && authorize(session, [s.management])}
//			onOpenChange={() => {
//				removeSearchParams({ add: "", edit: "", delete: "" }, router);
//				router.refresh();
//			}}>
//			<ModalContent>
//				<ModalHeader>Are you sure?</ModalHeader>
//				<ModalBody as="form" id="delete" action={deleteDayHandler}>
//					<p>This action will delete the day with all roll calls and events associated with it.</p>
//					<Input autoFocus type="password" label="Password" size="lg" name="password" />
//				</ModalBody>
//				<ModalFooter>
//					<Button color="danger" variant="light" onPress={() => removeSearchParams({ delete: "" }, router)}>
//						Cancel
//					</Button>
//					<Button color="danger" form="delete" type="submit">
//						Delete
//					</Button>
//				</ModalFooter>
//			</ModalContent>
//		</Modal>
//	);
//}
//
