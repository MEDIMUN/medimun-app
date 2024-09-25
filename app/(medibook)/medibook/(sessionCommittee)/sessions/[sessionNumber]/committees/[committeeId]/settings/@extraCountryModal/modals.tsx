"use client";

import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Dropdown } from "@/components/dropdown";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { authorize, s } from "@/lib/authorize";
import { removeSearchParams } from "@/lib/searchParams";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { addExtraCountry, editExtraCountry } from "./actions";

export function AddExtraCountryModal() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const { data: authSession, status } = useSession();

	const isManagement = authorize(authSession, [s.management]);

	function onClose() {
		removeSearchParams({ "add-extra-country": "" }, router);
	}

	async function addExtraCountryHandler(formData: FormData) {
		const res = await addExtraCountry(formData, params);
		if (res?.ok) {
			toast.success(res?.message);
			removeSearchParams({ "add-extra-country": "" }, router);
		} else {
			toast.error(res?.message);
			router.refresh();
		}
	}

	const isOpen =
		searchParams.has("add-extra-country") && status === "authenticated" && isManagement && !!params.sessionNumber && !!params.committeeId;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Add Extra Country or Entity</DialogTitle>
			<DialogDescription>Add a country or entity that is not part of the default list of countries and entities.</DialogDescription>
			<DialogBody className="flex flex-col gap-5">
				<div className="rounded-md bg-zinc-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
						</div>
						<div className="ml-3 flex-1 md:flex md:justify-between">
							<p className="text-sm text-zinc-700">
								The extra countries and entities added here will not be available within the delegate application process completed by school
								directors and can only be assigned to delegates manually by the management. In Security Councils and Special Committees these
								countries and entities can also be assigned by the chairs.
							</p>
						</div>
					</div>
				</div>
				<form id="add-extra-country" action={addExtraCountryHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Description>The long name of the country or entity.</Description>
						<Input placeholder="e.g. The European Union, Soviet Union." name="countryNameEn" required />
					</Field>
					<Field>
						<Label>Country/Organization Code</Label>
						<Description>The 2 to 4 letter code to distinctly identify the country/entity.</Description>
						<Input placeholder="e.g. EU, USSR." name="countryCode" required />
					</Field>
					<Field>
						<Label>Power to Veto</Label>
						<Select defaultValue="false" name="isPowerToVeto" required>
							<option value="true">Yes</option>
							<option value="false">No</option>
						</Select>
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button onClick={onClose} type="button" plain>
					Cancel
				</Button>
				<Button form="add-extra-country" type="submit">
					Add
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function EditExtraCountryModal({ selectedCommittee, selectedExtraCountry }) {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const { data: authSession, status } = useSession();

	const isManagement = authorize(authSession, [s.management]);

	function onClose() {
		removeSearchParams({ "edit-extra-country": "" }, router);
	}

	async function editExtraCountryHandler(formData: FormData) {
		const res = await editExtraCountry(formData, params, selectedExtraCountry.id);
		if (res?.ok) {
			toast.success(res?.message);
			removeSearchParams({ "edit-extra-country": "" }, router);
		} else {
			toast.error(res?.message);
			router.refresh();
		}
	}

	const isOpen =
		searchParams.has("edit-extra-country") &&
		status === "authenticated" &&
		isManagement &&
		!!params.sessionNumber &&
		!!params.committeeId &&
		!!searchParams.get("edit-extra-country") &&
		selectedExtraCountry?.id === searchParams.get("edit-extra-country") &&
		!!selectedExtraCountry;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>
				Edit {selectedExtraCountry?.countryCode} ({selectedExtraCountry?.countryNameEn}).
			</DialogTitle>
			<DialogDescription>
				You can&apos;t change the country/entity code. If you need to change it delete and re-add the country/entity.
			</DialogDescription>
			<DialogBody className="flex flex-col gap-5">
				<form id="edit-extra-country" action={editExtraCountryHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Description>The long name of the country or entity.</Description>
						<Input defaultValue={selectedExtraCountry?.name} placeholder="e.g. The European Union, Soviet Union." name="countryNameEn" required />
					</Field>
					<Field>
						<Label>Power to Veto</Label>
						<Select defaultValue={selectedExtraCountry?.isPowerToVeto ? "true" : "false"} name="isPowerToVeto" required>
							<option value="true">Yes</option>
							<option value="false">No</option>
						</Select>
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button onClick={onClose} type="button" plain>
					Cancel
				</Button>
				<Button form="edit-extra-country" type="submit">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}
