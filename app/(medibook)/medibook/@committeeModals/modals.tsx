"use client";

import { ReadonlyURLSearchParams, useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addCommittee, deleteCommittee, editCommittee } from "./actions";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { SlugInput } from "@/components/slugInput";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Select } from "@/components/select";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/use-flush-state";
import { romanize } from "@/lib/romanize";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";
import { useState } from "react";
import { Info } from "lucide-react";

function onClose(searchParams: ReadonlyURLSearchParams, router: any[] | AppRouterInstance) {
	/* 	if (searchParams.has("return")) router.push(searchParams.get("return"));
	 */ removeSearchParams({ "create-committee": "", "edit-committee": "", "delete-committee": "" }, router);
}

export function ModalEditCommittee({ selectedCommittee }) {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	async function addCommitteeHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await editCommittee(formData, selectedCommittee.id);
		if (res?.ok) {
			toast.success(res?.message);
			onClose(searchParams, router);
		} else {
			toast.error(res?.message);
			router.refresh();
		}
		setIsLoading(false);
	}

	const isOpen = searchParams.has("edit-committee") && authorize(authSession, [s.management]);

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>
				{searchParams.has("create-committee") ? `Add Committee to Session ${params.sessionNumber}` : `Edit ${selectedCommittee.name}`}
			</DialogTitle>

			<DialogBody>
				{/* @ts-ignore */}
				<form id="edit-committee" action={addCommitteeHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input defaultValue={selectedCommittee?.name} required name="name" />
					</Field>

					<Field>
						<Label>Short Name</Label>
						<Input defaultValue={selectedCommittee?.shortName?.toUpperCase()} name="shortName" />
					</Field>

					<Field>
						<Label>Committee Type</Label>
						<Select defaultValue={selectedCommittee?.type} required name="type">
							<option value="GENERALASSEMBLY">General Assembly</option>
							<option value="SECURITYCOUNCIL">Security Council</option>
							<option value="SPECIALCOMMITTEE">Special Committee</option>
						</Select>
					</Field>

					<Field>
						<Label>Visibility</Label>
						<Select defaultValue={selectedCommittee?.isVisible ? "true" : "false"} required name="isVisible">
							<option value="true">Visible</option>
							<option value="false">Hidden</option>
						</Select>
					</Field>

					<Field>
						<Label>Link Slug</Label>
						<SlugInput defaultValue={selectedCommittee?.slug} name="slug" />
					</Field>
				</form>
				<div className="mt-4 rounded-md bg-zinc-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<Info aria-hidden="true" className="h-5 w-5 text-zinc-400" />
						</div>
						<div className="ml-3 flex-1 md:flex md:justify-between">
							<p className="text-sm text-zinc-700">More committee options</p>
							<p className="mt-3 text-sm md:ml-6 md:mt-0">
								<Link
									href={`/medibook/sessions/${params.sessionNumber}/committees/${selectedCommittee.slug || selectedCommittee.id}/settings`}
									className="whitespace-nowrap font-medium text-zinc-700 hover:text-zinc-600">
									Committee Settings
									<span aria-hidden="true"> &rarr;</span>
								</Link>
							</p>
						</div>
					</div>
				</div>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button loading={isLoading} form="edit-committee" type="submit">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function ModalDeleteCommittee({ selectedCommittee }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession } = useSession();
	const [isLoading, setIsLoading] = useFlushState(false);

	async function deleteCommitteeHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await deleteCommittee(formData, selectedCommittee.id);
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
		removeSearchParams({ "add-committee": "", "edit-committee": "", "delete-committee": "" }, router);
	}

	const isOpen = searchParams.has("delete-committee") && authorize(authSession, [s.management]) && !!selectedCommittee;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>{`Delete ${selectedCommittee.name}`}</DialogTitle>
			<DialogDescription>Are you sure you want to delete {selectedCommittee.name}?</DialogDescription>
			<DialogBody>
				{/* @ts-ignore */}
				<form id="delete-committee" action={deleteCommitteeHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Password</Label>
						<Input type="password" required name="password" />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button loading={isLoading} form="delete-committee" type="submit">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function ModalCreateCommittee() {
	const { data: authSession, status } = useSession();

	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function addCommitteeHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await addCommittee(formData, params?.sessionNumber);
		if (res?.ok) {
			updateSearchParams({ "edit-committee": res.data }, router);
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	const isOpen =
		searchParams.has("create-committee") && status === "authenticated" && authorize(authSession, [s.management]) && !!params.sessionNumber;

	return (
		<Dialog onClose={() => onClose(searchParams, router)} open={isOpen}>
			<DialogTitle>Create New Committee</DialogTitle>
			<DialogDescription>Create a new committee in Session {romanize(params?.sessionNumber)}.</DialogDescription>
			<DialogBody>
				{/* @ts-ignore */}
				<form action={addCommitteeHandler} id="create-committee" className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input name="name" maxLength={100} minLength={5} />
					</Field>
					<Field>
						<Label>Short Name</Label>
						<Input name="shortName" maxLength={4} minLength={2} />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain disabled={isLoading} onClick={() => onClose(searchParams, router)}>
					Cancel
				</Button>
				<Button loading={isLoading} type="submit" form="create-committee" disabled={isLoading}>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}
