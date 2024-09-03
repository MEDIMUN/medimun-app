"use client";

import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { removeSearchParams } from "@/lib/searchParams";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { toast } from "sonner";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { deleteDepartment } from "./actions";

function onClose(searchParams: ReadonlyURLSearchParams, router: any[] | AppRouterInstance) {
	/* 	if (searchParams.has("return")) return router.push(searchParams.get("return"));
	 */ removeSearchParams({ "create-department": "", "edit-department": "", "delete-department": "" }, router);
}

export function ModalDeleteDepartment({ selectedDepartment }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession, status } = useSession();

	async function deleteDepartmentHandler(formData: FormData) {
		const res = await deleteDepartment(formData, selectedDepartment.id);
		if (res?.ok) {
			toast.success(res?.message);
			onClose(searchParams, router);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
	}

	const isOpen =
		searchParams.has("delete-department") && authorize(authSession, [s.management]) && !!selectedDepartment && status === "authenticated";

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>{`Delete ${selectedDepartment.name}`}</DialogTitle>
			<DialogDescription>Are you sure you want to delete {selectedDepartment.name}?</DialogDescription>
			<DialogBody>
				<form action={deleteDepartmentHandler} id="delete-department" className="flex flex-col gap-5">
					<Field>
						<Label>Password</Label>
						<Input type="password" name="password" />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color="red" form="delete-department" type="submit">
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
