"use client";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useSearchParams, useRouter, ReadonlyURLSearchParams } from "next/navigation";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addPolicy, deletePolicy, editPolicy } from "./actions";
import { SlugInput } from "@/components/slugInput";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { flushSync } from "react-dom";
import { useEffect, useRef } from "react";
import { Divider } from "@/components/divider";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Policy } from "@prisma/client";
import { Textarea } from "@/components/textarea";

function onClose(router: any[] | AppRouterInstance) {
	removeSearchParams({ "add-policy": "", "edit-policy": "", "delete-policy": "" }, router);
}

export function EditPolicyModal({ selectedPolicy }: { selectedPolicy: Policy }) {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function editPolicyHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		formData.append("id", selectedPolicy?.id);
		const res = await editPolicy(formData);
		if (res?.ok) {
			toast.success(res?.message);
			onClose(router);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.has("edit-policy") && !!selectedPolicy;

	return (
		<Dialog onClose={() => onClose(router)} open={isOpen as boolean}>
			<DialogTitle>{selectedPolicy.title}</DialogTitle>
			<DialogBody>
				<form id="edit-policy" action={editPolicyHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Title</Label>
						<Input disabled={isLoading} required defaultValue={selectedPolicy.title} name="title" />
					</Field>
					<Field>
						<Label>Description</Label>
						<Input disabled={isLoading} defaultValue={selectedPolicy.description} name="description" />
					</Field>
					<Field>
						<Label>Slug</Label>
						<SlugInput disabled={isLoading} defaultValue={selectedPolicy?.slug ? selectedPolicy.slug : undefined} name="slug" />
					</Field>
					<Field>
						<Label>MarkDown (Content)</Label>
						<Textarea disabled={isLoading} defaultValue={selectedPolicy.markdown} name="markdown" />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain disabled={isLoading} onClick={() => onClose(router)}>
					Cancel
				</Button>
				<Button disabled={isLoading} loading={isLoading} type="submit" form="edit-policy">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function AddPolicyModal() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function addPolicyHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await addPolicy(formData);
		if (res?.ok) {
			toast.success(res?.message);
			onClose(router);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.has("add-policy");

	return (
		<Dialog onClose={() => onClose(router)} open={isOpen as boolean}>
			<DialogTitle>Add Policy</DialogTitle>
			<DialogBody>
				<form id="add-policy" action={addPolicyHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Title</Label>
						<Input disabled={isLoading} required name="title" />
					</Field>
					<Field>
						<Label>Description</Label>
						<Input disabled={isLoading} name="description" />
					</Field>
					<Field>
						<Label>Slug</Label>
						<SlugInput disabled={isLoading} name="slug" />
					</Field>
					<Field>
						<Label>MarkDown (Content)</Label>
						<Textarea disabled={isLoading} name="markdown" />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain disabled={isLoading} onClick={() => onClose(router)}>
					Cancel
				</Button>
				<Button disabled={isLoading} loading={isLoading} type="submit" form="add-policy">
					Add
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function DeletePolicyModal({ selectedPolicy }: { selectedPolicy: Policy }) {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function deletePolicyHandler() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await deletePolicy(selectedPolicy.id);
		if (res?.ok) {
			toast.success(res?.message);
			onClose(router);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.has("delete-policy") && !!selectedPolicy;

	return (
		<Dialog onClose={() => onClose(router)} open={isOpen as boolean}>
			<DialogTitle>Delete Policy</DialogTitle>
			<DialogDescription>Delete {selectedPolicy.title}? This action cannot be undone.</DialogDescription>
			<DialogActions>
				<Button plain disabled={isLoading} onClick={() => onClose(router)}>
					Cancel
				</Button>
				<Button disabled={isLoading} loading={isLoading} onClick={deletePolicyHandler}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
