"use client";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams } from "@/lib/search-params";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Prisma } from "@prisma/client";
import { leaveAsCosubmitter, transferMainSubmitter } from "./action";
import { toast } from "sonner";

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

export function ModalTransferMainSubmitter({ selectedResolution }: { selectedResolution: ResolutionType }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const params = useParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit() {
		if (searchParams && !searchParams.has("co-submitter-id")) {
			toast.error("Co-submitter ID is required.");
			return;
		}
		const res = await transferMainSubmitter(selectedResolution.id, searchParams.get("co-submitter-id"));
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
		removeSearchParams({ "transfer-main-submitter": "", "co-submitter-id": "" }, router);
	}

	const isOpen = searchParams && selectedResolution && searchParams.has("transfer-main-submitter") && searchParams.has("co-submitter-id");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Transfer Main Submitter</DialogTitle>
			<DialogDescription>Are you sure you want to transfer the main submitter role? You will become a co-submitter.</DialogDescription>
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
