"use client";

import { ReadonlyURLSearchParams, useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { removeSearchParams } from "@/lib/searchParams";
import { SlugInput } from "@/components/slugInput";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Select } from "@/components/select";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { toast } from "sonner";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";

import { editDepartment } from "./actions";
import { useEffect, useState } from "react";
import { useFlushState } from "@/hooks/useFlushState";

function onClose(searchParams: ReadonlyURLSearchParams, router: any[] | AppRouterInstance) {
	/* 	if (searchParams.has("return")) return router.push(searchParams.get("return"));
	 */ removeSearchParams({ "create-department": "", "edit-department": "", "delete-department": "" }, router);
}

export function ModalEditDepartment({ selectedDepartment }) {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession } = useSession();
	const [type, setType] = useState(selectedDepartment?.type);
	const [isLoading, , setIsLoading] = useFlushState(false);

	async function editDepartmentHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		formData.append("type", type);
		const res = await editDepartment(formData, selectedDepartment.id);
		if (res?.ok) {
			toast.success(res?.message);
			onClose(searchParams, router);
			setType(selectedDepartment?.type);
		} else {
			toast.error(res?.message);
			router.refresh();
		}
		setIsLoading(false);
	}

	useEffect(() => {
		setType(selectedDepartment?.type);
	}, [selectedDepartment]);

	const isOpen = searchParams.has("edit-department") && authorize(authSession, [s.management]);

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>
				{searchParams.has("create-department") ? `Add Department to Session ${params.sessionNumber}` : `Edit ${selectedDepartment.name}`}
			</DialogTitle>

			<DialogBody>
				<form id="edit-department" action={editDepartmentHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input maxLength={100} minLength={3} defaultValue={selectedDepartment?.name} required name="name" />
					</Field>

					<Field>
						<Label>Short Name</Label>
						<Input maxLength={4} minLength={2} defaultValue={selectedDepartment?.shortName?.toUpperCase()} name="shortName" />
					</Field>
					<Field>
						<Label>Department Type</Label>
						<Listbox value={type} onChange={(val) => setType(val)} multiple>
							<ListboxOption value="APPROVAL">Approval Panel</ListboxOption>
							<ListboxOption value="CATERING">Food and Catering</ListboxOption>
							<ListboxOption value="FUNDING">Funding</ListboxOption>
							<ListboxOption value="ADVERTISING">Advertising</ListboxOption>
							<ListboxOption value="IT">IT</ListboxOption>
							<ListboxOption value="SALES">Sales</ListboxOption>
							<ListboxOption value="GRAPHIC">Graphic Design</ListboxOption>
							<ListboxOption value="SOCIAL">Social Media</ListboxOption>
							<ListboxOption value="PHOTO">Graphic Design</ListboxOption>
							<ListboxOption value="MEDINEWS">MediNews</ListboxOption>
							<ListboxOption value="PI">PI</ListboxOption>
							<ListboxOption value="PREP">Preparations</ListboxOption>
							<ListboxOption value="ADMINSTAFF">Admin Staff</ListboxOption>
							<ListboxOption value="DATA">
								<ListboxLabel>Data Entry</ListboxLabel>
								<ListboxDescription>Danger Zone</ListboxDescription>
							</ListboxOption>
							<ListboxOption value="OTHER">Other</ListboxOption>
						</Listbox>
					</Field>

					<Field>
						<Label>Visibility</Label>
						<Select defaultValue={selectedDepartment?.isVisible ? "true" : "false"} required name="isVisible">
							<option value="true">Visible</option>
							<option value="false">Hidden</option>
						</Select>
					</Field>

					<Field>
						<Label>Link Slug</Label>
						<SlugInput defaultValue={selectedDepartment?.slug} name="slug" />
					</Field>
				</form>
			</DialogBody>

			<DialogActions>
				<Button plain disabled={isLoading} onClick={onClose}>
					Cancel
				</Button>
				<Button disabled={isLoading} loading={isLoading} form="edit-department" type="submit">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}
