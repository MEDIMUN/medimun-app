"use client";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Prisma } from "@prisma/client";
import { Select } from "@/components/select";
import { createMediWriteResolution, inviteCoSubmitter } from "./action";
import { Input } from "@/components/input";
import { toast } from "sonner";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { countries } from "@/data/countries";
import { Avatar } from "@heroui/avatar";

type ApplicableDelegateType = Prisma.DelegateGetPayload<{
	include: {
		user: true;
	};
}>;

type ResolutionType = Prisma.ResolutionGetPayload<{
	include: {
		topic: true;
		mainSubmitter: {
			include: {
				user: true;
			};
		};
		committee: {
			include: {
				Topic: true;
			};
		};
		CoSubmitters: {
			include: {
				delegate: {
					include: {
						user: true;
					};
				};
			};
		};
	};
}>;

export function ModalInviteCoSubmitter({
	selectedResolution,
	applicableCommitteeDelegates,
}: {
	selectedResolution: ResolutionType;
	applicableCommitteeDelegates: ApplicableDelegateType[];
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		formData.append("resolutionId", selectedResolution.id);
		const res = await inviteCoSubmitter(formData);
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
		removeSearchParams({ "invite-co-submitter": "" }, router);
	}

	const isOpen = searchParams && selectedResolution && searchParams.has("invite-co-submitter");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Invite a Co-Submitter</DialogTitle>
			<DialogDescription>
				Co-Submitters will be able to view and edit this resolution until submitted, their delegation names will appear on the resolution. You can
				invite up to 15 co-submitters.
			</DialogDescription>
			<DialogBody onSubmit={handleSubmit} id="invite-cosubmitter" className="flex flex-col gap-6" as="form">
				<Field>
					<Label required>Delegation</Label>
					<Listbox name="delegateId">
						{applicableCommitteeDelegates
							.sort((a, b) => {
								const countryA = countries.find((country) => country.countryCode === a.country)?.countryNameEn;
								const countryB = countries.find((country) => country.countryCode === b.country)?.countryNameEn;
								return countryA?.localeCompare(countryB || "") || 0;
							})
							.map((delegate) => {
								const fullName = delegate.user.displayName || `${delegate.user.officialName} ${delegate.user.officialSurname}`;
								const allCountries = countries;
								const selectedCountry = allCountries?.find((country) => country?.countryCode === delegate?.country)?.countryNameEn;
								return (
									<ListboxOption key={delegate.id} value={delegate.id}>
										<Avatar
											slot="icon"
											isBordered
											className="w-5 h-5"
											size="sm"
											src={`https://flagcdn.com/h40/${delegate.country?.toLocaleLowerCase()}.png`}
											alt={selectedCountry + " flag"}
										/>
										<ListboxLabel>{selectedCountry}</ListboxLabel>
										<ListboxDescription>({fullName})</ListboxDescription>
									</ListboxOption>
								);
							})}
					</Listbox>
				</Field>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button color={"green"} disabled={isLoading} type="submit" form="invite-cosubmitter">
					Invite
				</Button>
			</DialogActions>
		</Dialog>
	);
}
