"use client";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";
import { Prisma } from "@prisma/client";
import { toast } from "sonner";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { countries } from "@/data/countries";
import { Avatar } from "@heroui/avatar";
import { assignResolutionToEditor } from "./actions";

type ApplicableDelegateType = Prisma.MemberGetPayload<{
	include: {
		user: true;
	};
}>;

type ResolutionType = Prisma.ResolutionGetPayload<{
	include: {
		topic: true;
		committee: {
			include: {
				Topic: true;
			};
		};
	};
}>;

export function ModalAssignToEditor({
	selectedResolution,
	membersOfAp,
}: {
	selectedResolution: ResolutionType;
	membersOfAp: ApplicableDelegateType[];
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const res = await assignResolutionToEditor({
			resolutionId: selectedResolution.id,
			memberId: formData.get("memberId") as string,
		});
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
		removeSearchParams({ "assign-to-editor": "" }, router);
	}

	const isOpen = searchParams && selectedResolution && searchParams.has("assign-to-editor");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Assign Resolution To Editor</DialogTitle>
			<DialogDescription>
				Assign the resolution to an editor. The editor will be able to edit the resolution and send it back to the approval panel once done.
			</DialogDescription>
			<DialogBody onSubmit={handleSubmit} id="invite-cosubmitter" className="flex flex-col gap-6" as="form">
				<Field>
					<Label required>Member</Label>
					<Listbox name="memberId">
						{membersOfAp.map((member) => {
							const fullName = member.user.displayName || `${member.user.officialName} ${member.user.officialSurname}`;
							return (
								<ListboxOption key={member.id} value={member.id}>
									<Avatar
										slot="icon"
										showFallback
										className="w-5 h-5"
										size="sm"
										src={`/api/users/${member.user.id}/avatar`}
										alt={"Profile Picture"}
									/>
									<ListboxLabel>{fullName}</ListboxLabel>
									<ListboxDescription>({member.user.id})</ListboxDescription>
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
					Assign
				</Button>
			</DialogActions>
		</Dialog>
	);
}
