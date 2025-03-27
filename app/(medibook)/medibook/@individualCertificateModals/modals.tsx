"use client";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Avatar } from "@heroui/avatar";
import Paginator from "@/components/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { removeSearchParams } from "@/lib/search-params";
import { deleteIndividualCertificate, editIndividualCertificate } from "./actions";
import { useState } from "react";
import { toast } from "sonner";

export function ModalCreateCertificates({
	selectedCertificate,
	seniorDirectorUsers,
	secretaryGeneralUser,
	totalSeniorDirectors,
}: {
	selectedCertificate: any;
	seniorDirectorUsers: any;
	secretaryGeneralUser: any;
	totalSeniorDirectors: any;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);

	const isOpen = !!seniorDirectorUsers?.length && !!secretaryGeneralUser && !!totalSeniorDirectors && !!searchParams && searchParams.has("edit-participation-certificate");

	function onClose() {
		removeSearchParams({ "edit-participation-certificate": null }, router);
	}

	async function handleSubmit(formData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await editIndividualCertificate({ formData, certificateId: selectedCertificate.id });
		if (res?.ok) {
			toast.success(...res?.message);
			onClose();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Create Certificates</DialogTitle>
			<DialogDescription>Edit the individual certificate details.</DialogDescription>
			<DialogBody id="edit-participation-certificates" action={handleSubmit} as="form" className="space-y-6">
				<Field>
					<Label>Custom Name Override</Label>
					<Input name="nameOverride" placeholder="e.g. Berzan Özejder" defaultValue={selectedCertificate?.nameOverride} />
				</Field>
				<Field>
					<Label>Special Message</Label>
					<Textarea name="specialMessage" placeholder="e.g. This delegate has..." defaultValue={selectedCertificate?.specialMessage} />
				</Field>
				<Field>
					<Label>Senior Director Signee</Label>
					<Listbox defaultValue={selectedCertificate.teacherSignatureId} name="seniorDirector">
						{seniorDirectorUsers.map((user) => (
							<ListboxOption key={user.id} value={user.id}>
								<Avatar showFallback isBordered className="w-5 h-5" size="sm" src={`/api/users/${user.id}/avatar`} />
								<ListboxLabel>
									{user.officialName} {user.officialSurname}
								</ListboxLabel>
							</ListboxOption>
						))}
					</Listbox>
				</Field>
				<Paginator totalItems={totalSeniorDirectors} itemsPerPage={10} itemsOnPage={seniorDirectorUsers.length} />
				<Field>
					<Label>Secretary General Signee</Label>
					<Listbox defaultValue={selectedCertificate.studentSignatureId} name="secretaryGeneral">
						<ListboxOption value={secretaryGeneralUser.id}>
							<Avatar showFallback isBordered className="w-5 h-5" size="sm" src={`/api/users/${secretaryGeneralUser.id}/avatar`} />
							<ListboxLabel>
								{secretaryGeneralUser.officialName} {secretaryGeneralUser.officialSurname}
							</ListboxLabel>
						</ListboxOption>
					</Listbox>
				</Field>
				<Field>
					<Label>Void Certificate</Label>
					<Description>Replace the certificate with a void notice.</Description>
					<Listbox defaultValue={selectedCertificate.isVoid ? "true" : "false"} name="isVoid">
						<ListboxOption value="true">Void</ListboxOption>
						<ListboxOption value="false">Valid</ListboxOption>
					</Listbox>
				</Field>
				<Field>
					<Label>Void Message</Label>
					<Description>The description or reasoning to appear on the void certificate notice.</Description>
					<Textarea defaultValue={selectedCertificate.voidMessage} name="voidMessage" placeholder="e.g. This certificate has been voided due to this student vaping in the..." />
				</Field>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} type={"submit"} form="edit-participation-certificates">
					Update
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function ModalDeleteCertificate({ certificateId }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);

	const isOpen = !!certificateId && !!searchParams && searchParams.has("delete-participation-certificate");

	function onClose() {
		removeSearchParams({ "delete-participation-certificate": null }, router);
	}

	async function handleSubmit() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await deleteIndividualCertificate({ certificateId });
		if (res?.ok) {
			toast.success(...res?.message);
			onClose();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Delete Certificate</DialogTitle>
			<DialogDescription>Are you sure you want to delete this certificate?</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} onClick={handleSubmit} color={"red"}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
