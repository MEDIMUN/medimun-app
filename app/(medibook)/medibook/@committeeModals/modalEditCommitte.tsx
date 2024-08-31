"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addCommittee, deleteCommittee } from "./actions";
import { removeSearchParams } from "@/lib/searchParams";
import { SlugInput } from "@/components/slugInput";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/select";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { toast } from "sonner";

export function ModalEditCommittee({ selectedCommittee }) {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession } = useSession();

	async function addCommitteeHandler(formData: FormData) {
		formData.append("committeeId", searchParams.get("edit-committee"));
		const res = await addCommittee(formData);
		if (res) toast(res?.message);
		if (res?.ok) {
			removeSearchParams({ "create-committee": "", "edit-committee": "", "delete-committee": "" }, router);
			router.refresh();
		}
	}

	function onClose() {
		removeSearchParams({ "add-committee": "", "edit-committee": "", "delete-committee": "" }, router);
	}

	const isOpen = searchParams.has("edit-committee") && authorize(authSession, [s.management]);

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Add Committee to Session {params.sessionNumber}</DialogTitle>

			<DialogBody>
				{/* @ts-ignore */}
				<form id="editcommittee1" action={addCommitteeHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input defaultValue={selectedCommittee?.name} required name="name" />
					</Field>

					<Field>
						<Label>Short Name</Label>
						<Input defaultValue={selectedCommittee?.shortName?.toUpperCase()} name="shortName" />
					</Field>

					<Field>
						<Label>Committee Type</Label>
						<Select defaultValue={selectedCommittee?.type} required name="committeeType">
							<option value="GENERALASSEMBLY">General Assembly</option>
							<option value="SECURITYCOUNCIL">Security Council</option>
							<option value="SPECIALCOMMITTEE">Special Committee</option>
						</Select>
					</Field>

					<Field>
						<Label>Visibility</Label>
						<Select defaultValue={selectedCommittee?.isVisible ? "true" : "false"} required name="committeeType">
							<option value="true">Visible</option>
							<option value="false">Hidden</option>
						</Select>
					</Field>

					<Field>
						<Label>Link Slug</Label>
						<SlugInput defaultValue={selectedCommittee?.slug} name="slug" />
					</Field>
				</form>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button form="editcommittee1" type="submit">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}
