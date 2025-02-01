"use client";

import { ReadonlyURLSearchParams, useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addInvoice, deleteInvoice, editInvoice, getSchools, getUsers } from "./actions";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { SlugInput } from "@/components/slugInput";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Select } from "@/components/select";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/use-flush-state";
import { romanize } from "@/lib/romanize";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { InvoiceItem, InvoiceWithRelations, sortItems } from "./default";
import { InvoiceItemsEditor } from "./_components/invoice-item-editor";
import moment from "moment";
import { Dropdown } from "@/components/dropdown";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Text } from "@/components/text";
import { useDebouncedValue } from "@mantine/hooks";
import Form from "next/form";
import { parseFormData } from "@/lib/parse-form-data";

function onClose(searchParams: ReadonlyURLSearchParams, router: any[] | AppRouterInstance) {
	/* 	if (searchParams.has("return")) router.push(searchParams.get("return"));
	 */ removeSearchParams({ "create-invoice": "", "edit-invoice": "", "delete-invoice": "" }, router);
}

export function ModalEditInvoice({ selectedInvoice }: { selectedInvoice: InvoiceWithRelations }) {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const [items, setItems] = useState<InvoiceItem[]>(sortItems(JSON.parse(selectedInvoice.items)));
	const [isPaid, setIsPaid] = useState(selectedInvoice.isPaid);

	async function addInvoiceHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const itemsToSave = JSON.stringify(sortItems(items));
		formData.set("items", itemsToSave);
		const res = await editInvoice(formData, selectedInvoice.id);
		if (res?.ok) {
			toast.success(res?.message);
			onClose(searchParams, router);
		} else {
			toast.error(res?.message);
			router.refresh();
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.has("edit-invoice") && authorize(authSession, [s.management]) && !!selectedInvoice;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>{`Edit Invoice #${selectedInvoice.number}`}</DialogTitle>

			<DialogBody>
				<form id="edit-invoice" action={addInvoiceHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Description</Label>
						<Input defaultValue={selectedInvoice?.description} required name="description" />
					</Field>

					<Field>
						<Label>Creation Date</Label>
						<Input defaultValue={moment(selectedInvoice.date, "YYYY-MM-DD").format("YYYY-MM-DD")} type="date" name="date" />
					</Field>

					<Field>
						<Label>Due Date</Label>
						<Input defaultValue={moment(selectedInvoice.dueDate, "YYYY-MM-DD").format("YYYY-MM-DD")} type="date" name="dueDate" />
					</Field>

					<Field>
						<Label>Status</Label>
						<Select required name="isPaid" onChange={(e) => setIsPaid(e.target.value.toString())} defaultValue={isPaid}>
							<option value="true">Paid</option>
							<option value="false">Not Paid</option>
						</Select>
					</Field>
					{!selectedInvoice.isPaid && isPaid == "true" && (
						<CheckboxField>
							<Checkbox name="notify" />
							<Label>Notify via Email</Label>
						</CheckboxField>
					)}

					<InvoiceItemsEditor onChange={setItems} initialItems={JSON.parse(selectedInvoice.items)} />
				</form>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button loading={isLoading} form="edit-invoice" type="submit">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function ModalDeleteInvoice({ selectedInvoice }: { selectedInvoice: InvoiceWithRelations }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession } = useSession();
	const [isLoading, setIsLoading] = useFlushState(false);

	async function deleteInvoiceHandler() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await deleteInvoice(selectedInvoice.id);
		if (res?.ok) {
			toast.success(res?.message);
			onClose();
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	function onClose() {
		removeSearchParams({ "add-invoice": "", "edit-invoice": "", "delete-invoice": "" }, router);
	}

	const isOpen = searchParams && searchParams.has("delete-invoice") && authorize(authSession, [s.management]) && !!selectedInvoice;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>{`Delete Invoice #${selectedInvoice.number}`}</DialogTitle>
			<DialogDescription>Are you sure you want to delete invoce #{selectedInvoice.number}?</DialogDescription>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color={"red"} loading={isLoading} onClick={deleteInvoiceHandler} type="submit">
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function ModalCreateInvoice() {
	const { data: authSession, status } = useSession();

	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);
	const [items, setItems] = useState<InvoiceItem[]>([]);
	const [isPaid, setIsPaid] = useState("false");
	const [schoolSearch, setSchoolSearch] = useState("");
	const [selectedSchool, setSelectedSchool] = useState(null);
	const [schools, setSchools] = useState([]);
	const [debouncedSchoolSearch] = useDebouncedValue(schoolSearch, 500);

	const [userSearch, setUserSearch] = useState("");
	const [selectedUser, setSelectedUser] = useState(null);
	const [users, setUsers] = useState([]);
	const [debouncedUserSearch] = useDebouncedValue(userSearch, 500);

	async function addInvoiceHandler(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		formData.set("items", JSON.stringify(sortItems(items)));
		formData.set("sessionNumber", params?.sessionNumber);
		if (isLoading) return;
		setIsLoading(true);
		const res = await addInvoice(formData);
		if (res?.ok) {
			removeSearchParams({ "create-invoice": "" });
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	useEffect(() => {
		async function fetchSchools() {
			if (!debouncedSchoolSearch) return;
			setIsLoading(true);
			const schools = await getSchools(schoolSearch);
			if (schools.ok) setSchools(schools.data);
			setIsLoading(false);
		}
		fetchSchools();
	}, [debouncedSchoolSearch]);

	useEffect(() => {
		async function fetchUsers() {
			if (!debouncedUserSearch) return;
			setIsLoading(true);
			const users = await getUsers(userSearch);
			if (users.ok) setUsers(users.data);
			setIsLoading(false);
		}
		fetchUsers();
	}, [debouncedUserSearch]);

	const isOpen = searchParams.has("create-invoice") && status === "authenticated" && authorize(authSession, [s.management]);
	return (
		<Dialog onClose={() => onClose(searchParams, router)} open={isOpen}>
			<DialogTitle>Create New Invoice</DialogTitle>
			<DialogDescription>Create a new invoice in Session {romanize(params?.sessionNumber)}.</DialogDescription>
			<DialogBody>
				{/* @ts-ignore */}
				<form id="create-invoice" onSubmit={addInvoiceHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Description</Label>
						<Input required name="description" />
					</Field>
					<Field>
						<Label>Creation Date</Label>
						<Input type="date" name="date" />
					</Field>
					<Field>
						<Label>Due Date</Label>
						<Input type="date" name="dueDate" />
					</Field>
					<CheckboxField>
						<Checkbox name="invoiceNotify" />
						<Label>Send Invoice Notification</Label>
					</CheckboxField>
					<Field>
						<Label>Status</Label>
						<Select required name="isPaid" onChange={(e) => setIsPaid(e.target.value.toString())} defaultValue={isPaid}>
							<option value="true">Paid</option>
							<option value="false">Not Paid</option>
						</Select>
					</Field>
					{isPaid == "true" && (
						<CheckboxField>
							<Checkbox name="receiptNotify" />
							<Label>Send Receipt Notification</Label>
						</CheckboxField>
					)}
					<div>
						<Text>Search for a school and select it.</Text>
						<div className="flex gap-2">
							<Input onChange={(e) => setSchoolSearch(e.target.value)} type="search" value={schoolSearch} />

							<Select required name="schoolId" disabled={isLoading} onChange={(e) => setSelectedSchool(e.target.value)}>
								<option value={"null"}>None</option>
								{schools.map((school) => (
									<option key={school.id} value={school.id}>
										{school.name}
									</option>
								))}
							</Select>
						</div>
					</div>
					<div>
						<Text>Search for a user and select it.</Text>
						<div className="flex gap-2">
							<Input onChange={(e) => setUserSearch(e.target.value)} type="search" value={userSearch} />
							<Select required name="userId" disabled={isLoading} onChange={(e) => setSelectedUser(e.target.value)}>
								<option value={"null"}>None</option>
								{users.map((user) => (
									<option key={user.id} value={user.id}>
										{user.displayName || `${user.officialName} ${user.officialSurname}`} ({user.id})
									</option>
								))}
							</Select>
						</div>
					</div>
					{selectedSchool || selectedUser ? null : <Text className="!text-red-500">Select either a school or a user or both.</Text>}
					<InvoiceItemsEditor onChange={setItems} initialItems={[]} />
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain disabled={isLoading} onClick={() => onClose(searchParams, router)}>
					Cancel
				</Button>
				<Button loading={isLoading} type="submit" form="create-invoice" disabled={isLoading || !(selectedSchool || selectedUser)}>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}
