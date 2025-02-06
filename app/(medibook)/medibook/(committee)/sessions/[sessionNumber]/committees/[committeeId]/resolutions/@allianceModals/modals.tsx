"use client";

import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";
import { Prisma } from "@prisma/client";
import { toast } from "sonner";
import { createAlliance, deleteAlliance, inviteAllianceMember, leaveAsAllianceMember, transferAllianceOwner } from "./action";
import { Select } from "@/components/select";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { countries } from "@/data/countries";
import { Avatar } from "@heroui/avatar";

type ApplicableDelegateType = Prisma.DelegateGetPayload<{
	include: {
		user: true;
	};
}>;

type AllianceType = Prisma.AllianceGetPayload<{
	select: {
		id: true;
		number: true;
	};
}>;

//create-alliance
export function ModalCreateAlliance({ selectedCommittee }: { selectedCommittee: Prisma.CommitteeGetPayload<{ select: { id: true; Topic: true } }> }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const topicId = formData.get("topicId") as string;
		const res = await createAlliance({ topicId, committeeId: selectedCommittee.id });
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
			onClose();
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	function onClose() {
		removeSearchParams({ "create-alliance": null });
	}

	const isOpen = searchParams && selectedCommittee && searchParams.has("create-alliance");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Create Alliance</DialogTitle>
			<form onSubmit={handleSubmit}>
				<DialogBody>
					<Select name="topicId" label="Select Topic">
						{selectedCommittee.Topic.map((topic) => (
							<option key={topic.id} value={topic.id}>
								{topic.title}
							</option>
						))}
					</Select>
				</DialogBody>
				<DialogActions>
					<Button disabled={isLoading} plain onClick={onClose}>
						Cancel
					</Button>
					<Button color={"green"} disabled={isLoading} type="submit">
						Create
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

//transfer-alliance-owner AND delegate-id
export function ModalTransferAllianceOwner({ selectedAlliance }: { selectedAlliance: AllianceType }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit() {
		if (searchParams && !searchParams.has("delegate-id")) {
			toast.error("Delegate ID is required.");
			return;
		}
		const res = await transferAllianceOwner({ allianceId: selectedAlliance.id, delegateId: searchParams.get("delegate-id") });
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	function onClose() {
		removeSearchParams({ "transfer-alliance-owner": null, "delegate-id": null });
	}

	const isOpen = searchParams && selectedAlliance && searchParams.has("transfer-alliance-owner") && searchParams.has("delegate-id");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Transfer Alliance {selectedAlliance.number.toString().padStart(5, "0")} Ownership</DialogTitle>
			<DialogDescription>Are you sure you want to transfer the ownership of this alliance?</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button color={"red"} disabled={isLoading} onClick={handleSubmit}>
					Transfer
				</Button>
			</DialogActions>
		</Dialog>
	);
}

//invite-alliance-member
export function ModalInviteAllianceMember({
	selectedAlliance,
	applicableDelegates,
}: {
	selectedAlliance: Prisma.AllianceGetPayload<{
		select: {
			id: true;
			number: true;
		};
		include: {
			committee: {
				select: {
					ExtraCountry: true;
				};
			};
		};
	}>;
	applicableDelegates: ApplicableDelegateType[];
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const delegateId = formData.get("delegateId") as string;
		const res = await inviteAllianceMember({ allianceId: selectedAlliance.id, delegateId });
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
			removeSearchParams({ "invite-alliance-member": null });
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	function onClose() {
		removeSearchParams({ "invite-alliance-member": null });
	}

	const isOpen = searchParams && selectedAlliance && searchParams.has("invite-alliance-member");
	const allCountries = selectedAlliance.committee.ExtraCountry.concat(countries);
	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Invite Alliance Member</DialogTitle>
			<form onSubmit={handleSubmit}>
				<DialogBody>
					<Listbox name="delegateId">
						{applicableDelegates.map((delegate) => {
							const fullName = delegate.user.displayName || `${delegate.user.officialName} ${delegate.user.officialSurname}`;
							const country = allCountries?.find((country) => country?.countryCode === delegate?.country);
							return (
								<ListboxOption key={delegate.id} value={delegate.id}>
									<Avatar slot="icon" isBordered className="w-5 h-5" size="sm" src={`https://flagcdn.com/h40/${country?.countryCode.toLocaleLowerCase()}.png`} />
									<ListboxLabel>{country?.countryNameEn || "N/A"}</ListboxLabel>
									<ListboxDescription>{fullName}</ListboxDescription>
								</ListboxOption>
							);
						})}
					</Listbox>
				</DialogBody>
				<DialogActions>
					<Button disabled={isLoading} plain onClick={onClose}>
						Cancel
					</Button>
					<Button color={"green"} disabled={isLoading} type="submit">
						Invite
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

//leave-alliance
export function ModalLeaveAlliance({ selectedAlliance }: { selectedAlliance: AllianceType }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit() {
		const res = await leaveAsAllianceMember({ allianceId: selectedAlliance.id });
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	function onClose() {
		removeSearchParams({ "leave-alliance": null });
	}

	const isOpen = searchParams && selectedAlliance && searchParams.has("leave-alliance");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Leave Alliance</DialogTitle>
			<DialogDescription>Are you sure you want to leave this alliance?</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button color={"red"} disabled={isLoading} onClick={handleSubmit}>
					Leave
				</Button>
			</DialogActions>
		</Dialog>
	);
}

//delete-alliance
export function ModalDeleteAlliance({ selectedAlliance }: { selectedAlliance: AllianceType }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit() {
		const res = await deleteAlliance({ allianceId: selectedAlliance.id });
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	function onClose() {
		removeSearchParams({ "delete-alliance": null });
	}

	const isOpen = searchParams && selectedAlliance && searchParams.has("delete-alliance");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Delete Alliance</DialogTitle>
			<DialogDescription>Are you sure you want to delete this alliance?</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button color={"red"} disabled={isLoading} onClick={handleSubmit}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
