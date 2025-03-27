"use client";

import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Session } from "@prisma/client";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Avatar } from "@heroui/avatar";
import Paginator from "@/components/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { removeSearchParams } from "@/lib/search-params";
import { createCertificates } from "./actions";
import { useSelectedContext } from "@/app/(medibook)/medibook/(global)/users/components/StateStateProvider";
import { useState } from "react";
import { toast } from "sonner";
import { flushSync } from "react-dom";

export function ModalCreateCertificates({
	selectedSession,
	seniorDirectorUsers,
	secretaryGeneralUser,
	totalSeniorDirectors,
}: {
	selectedSession: Session;
	seniorDirectorUsers: any;
	secretaryGeneralUser: any;
	totalSeniorDirectors: any;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { selected, setSelected } = useSelectedContext();
	const [isLoading, setIsLoading] = useState(false);

	const isOpen = !!selectedSession && !!seniorDirectorUsers?.length && !!secretaryGeneralUser && !!totalSeniorDirectors && !!searchParams && searchParams.has("create-participation-certificates");

	function onClose() {
		removeSearchParams({ "create-participation-certificates": null }, router);
	}

	async function handleSubmit(formData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await createCertificates({ formData, selectedUsers: selected, selectedSession });
		if (res?.ok) {
			removeSearchParams({ select: null, "create-participation-certificates": null });
			router.refresh();
			flushSync(() => setSelected([]));
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
			<DialogDescription>
				This will create the certificates for all selected users.{" "}
				{selectedSession.publishCertificates
					? "Since the certificates have been published for the session, the created certificates will be made available instantly and all users who receive certificates will be notified via email."
					: "The certificates have not been published for this session hence the created certificates will not be made available until the session certificates have been published. No users will be notified."}
			</DialogDescription>
			<DialogBody id="create-participation-certificates" action={handleSubmit} as="form" className="space-y-6">
				<Field>
					<Label>Custom Name Override</Label>
					<Input name="nameOverride" placeholder="e.g. Berzan Özejder" />
				</Field>
				<Field>
					<Label>Special Message</Label>
					<Textarea name="specialMessage" placeholder="e.g. This delegate has..." />
				</Field>
				<Field>
					<Label>Senior Director Signee</Label>
					<Listbox name="seniorDirector">
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
					<Listbox name="secretaryGeneral">
						<ListboxOption value={secretaryGeneralUser.id}>
							<Avatar showFallback isBordered className="w-5 h-5" size="sm" src={`/api/users/${secretaryGeneralUser.id}/avatar`} />
							<ListboxLabel>
								{secretaryGeneralUser.officialName} {secretaryGeneralUser.officialSurname}
							</ListboxLabel>
						</ListboxOption>
					</Listbox>
				</Field>
				{selectedSession.publishCertificates && (
					<Field>
						<Label>Notify Users</Label>
						<Description>Users who receive certificates will be notified via email.</Description>
						<Listbox defaultValue="true" name="notifyUsers">
							<ListboxOption value="true">Yes</ListboxOption>
							<ListboxOption value="false">No</ListboxOption>
						</Listbox>
					</Field>
				)}
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} type={"submit"} form="create-participation-certificates" color={"red"}>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}
