"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useSearchParams, useRouter } from "next/navigation";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";

export function AddLocationModal() {
	const { data: authSession, status } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function createLocationHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = 1;
		if (res?.ok) {
			onClose();
			updateSearchParams({ edit: res?.id }, router);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isOpen =
		searchParams &&
		searchParams.has("create-new-group") &&
		status === "authenticated" &&
		authSession.user.currentRoleNames.length + authSession.user.currentRoleNames.length > 0;

	function onClose() {
		removeSearchParams({ "create-new-group": "" }, router);
	}

	return (
		<Dialog onClose={onClose} open={isOpen as boolean}>
			<DialogTitle>Create New Group</DialogTitle>
			<DialogBody>
				<form id="add" action={createLocationHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input required name="name" />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain disabled={isLoading} onClick={onClose}>
					Cancel
				</Button>
				<Button loading={isLoading} disabled={isLoading} type="submit" form="add">
					Next
				</Button>
			</DialogActions>
		</Dialog>
	);
}
