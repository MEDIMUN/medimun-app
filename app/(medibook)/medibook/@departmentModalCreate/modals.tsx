"use client";

import { ReadonlyURLSearchParams, useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/useFlushState";
import { romanize } from "@/lib/romanize";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { addDepartment } from "./actions";

function onClose(searchParams: ReadonlyURLSearchParams, router: any[] | AppRouterInstance) {
	/* 	if (searchParams.has("return")) return router.push(searchParams.get("return"));
	 */ removeSearchParams({ "create-department": "", "edit-department": "", "delete-department": "" }, router);
}

export function ModalCreateDepartment() {
	const { data: authSession, status } = useSession();

	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	const addDepartmentHandler = async (formData: FormData) => {
		const res = await addDepartment(formData, params?.sessionNumber);
		if (res?.ok) {
			updateSearchParams({ "edit-department": res.data }, router);
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	};

	const isOpen =
		searchParams.has("create-department") && status === "authenticated" && authorize(authSession, [s.management]) && !!params.sessionNumber;

	return (
		<Dialog onClose={() => onClose(searchParams, router)} open={isOpen}>
			<DialogTitle>Create New Department</DialogTitle>
			<DialogDescription>Create a new department in Session {romanize(params?.sessionNumber)}.</DialogDescription>
			<DialogBody>
				<form id="create-department" action={addDepartmentHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input name="name" maxLength={100} minLength={3} />
					</Field>
					<Field>
						<Label>Short Name</Label>
						<Input name="shortName" maxLength={4} minLength={2} />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={() => onClose(searchParams, router)}>
					Cancel
				</Button>
				<Button type="submit" form="create-department" disabled={isLoading}>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}
