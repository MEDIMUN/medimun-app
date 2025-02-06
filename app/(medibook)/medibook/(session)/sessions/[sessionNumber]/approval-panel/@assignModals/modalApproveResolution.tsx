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
import { approveResolution, assignResolutionToEditor } from "./actions";

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

export function ModalApproveResolution({ selectedResolution }: { selectedResolution: ResolutionType }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	function onClose() {
		removeSearchParams({ "approve-resolution": "" });
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (isLoading) return;
		setIsLoading(true);
		const res = await approveResolution({
			resolutionId: selectedResolution.id,
		});
		if (res?.ok) {
			toast.success(res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.has("approve-resolution") && !!selectedResolution;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Approve Resolution</DialogTitle>
			<DialogDescription>Approved resolutions will be put to the return pile not sent to committees immediately.</DialogDescription>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color={"green"} type="submit" onClick={handleSubmit}>
					Approve
				</Button>
			</DialogActions>
		</Dialog>
	);
}
