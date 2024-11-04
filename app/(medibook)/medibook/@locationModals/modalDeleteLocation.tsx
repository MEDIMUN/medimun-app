"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useSearchParams, useRouter } from "next/navigation";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addLocation, deleteCoverImage, deleteLocation, editLocation, updateCoverImage } from "./actions";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";

export function DeleteLocationModal({ location, total }) {
	const { data: session, status } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pageInteger = parseInt(searchParams.get("page"));

	const [isLoading, setIsLoading] = useFlushState(false);

	if (!location) return;

	async function deleteLocationHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		formData.append("id", location.id);
		const res = await deleteLocation(formData);
		const isChange = (total - 1) % 10 === 0;
		if (res?.ok) {
			toast.success(res?.message);
			if (isChange && pageInteger == Math.ceil(total / 10)) {
				const page = pageInteger ? pageInteger - 1 : 1;
				updateSearchParams({ delete: "", page: page });
			}
			removeSearchParams({ "create-location": "", "edit-location": "", "delete-location": "", return: "" }, router);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	const isOpen = searchParams.has("delete-location") && status === "authenticated" && authorize(session, [s.management]);

	function onClose() {
		if (searchParams.has("return")) {
			router.push(searchParams.get("return"));
		} else {
			removeSearchParams({ "create-location": "", "edit-location": "", "delete-location": "", return: "" }, router);
		}
	}

	return (
		<Dialog onClose={onClose} open={isOpen as boolean}>
			<DialogTitle>Delete {location.name}</DialogTitle>
			<DialogDescription>
				This action cannot be undone. The location is linked to {location.school.length || "no"} school{location.school.length == 1 ? "" : "s"}.
			</DialogDescription>
			<DialogBody>
				{/* @ts-ignore Server Action */}
				<form id="delete" action={deleteLocationHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Password</Label>
						<Input autoFocus required type="password" name="password" />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain disabled={isLoading} onClick={onClose}>
					Cancel
				</Button>
				<Button color="red" loading={isLoading} disabled={isLoading} type="submit" form="delete">
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
