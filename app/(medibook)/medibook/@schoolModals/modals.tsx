"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useSearchParams, useRouter, ReadonlyURLSearchParams } from "next/navigation";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addSchool, deleteCoverImage, deleteSchool, editSchool, updateCoverImage } from "./actions";
import { countries } from "@/data/countries";
import { SlugInput } from "@/components/slugInput";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/useFlushState";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { flushSync } from "react-dom";
import { useEffect, useRef } from "react";
import { Divider } from "@/components/divider";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

function onClose(searchParams: ReadonlyURLSearchParams, router: any[] | AppRouterInstance) {
	if (searchParams.has("return")) {
		router.push(searchParams.get("return"));
	}
	removeSearchParams({ "add-school": "", "edit-school": "", "delete-school": "" }, router);
}

export function EditSchoolModal({ edit, locations }) {
	const { data: authSession } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();

	const [isLoading, setIsLoading] = useFlushState(false);
	const [url, setUrl] = useFlushState("/placeholders/cover.jpg");
	const formRef = useRef(null);
	const inputRef = useRef();

	async function removeCoverImageHandler() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await deleteCoverImage(edit?.id);
		if (res?.ok) {
			router.refresh();
			setUrl("");
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function onImageUpdate(e) {
		const coverImage = e.target.files[0];
		if (!coverImage) return toast.error("Profile Picture is required");
		if (coverImage.size > 10000000) return toast.error("The maximun file size is 10MB");
		if (!["image/png", "image/gif", "image/jpeg"].includes(coverImage.type)) return toast.error("File type is not supported");
		setUrl(URL.createObjectURL(e.target.files[0]));
		const formData = new FormData(formRef.current);
		formData.append("id", edit?.id);
		flushSync(() => {
			setIsLoading(true);
		});

		const res = await updateCoverImage(formData);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function editSchoolHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		formData.append("id", edit?.id);
		const res = await editSchool(formData);
		if (res?.ok) {
			toast.success(res?.message);
			onClose(searchParams, router);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams.has("edit-school") && authorize(authSession, [s.management]);

	useEffect(() => {
		if (edit?.cover) {
			setUrl(`/api/schools/${edit?.id}/cover`);
		} else {
			setUrl("/placeholders/cover.jpg");
		}
	}, [edit, setUrl]);

	return (
		<Dialog onClose={() => onClose(searchParams, router)} open={isOpen as boolean}>
			<DialogTitle>{edit?.name}</DialogTitle>
			<DialogBody>
				{/* @ts-ignore Server Action */}
				<form id="update" action={editSchoolHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input required defaultValue={edit?.name} name="name" />
					</Field>
					<Field>
						<Label>Slug</Label>
						<SlugInput defaultValue={edit?.slug} name="slug" />
					</Field>
					<Field>
						<Label>Year Joined</Label>
						<Input type="text" defaultValue={edit?.joinYear} name="joinYear" />
					</Field>
					<Field>
						<Label>Location</Label>
						<Listbox defaultValue={edit?.location?.id} name="locationId">
							<ListboxOption key="null" value="null">
								<ListboxLabel>None</ListboxLabel>
							</ListboxOption>
							{!!locations &&
								locations.map((location) => (
									<ListboxOption key={location.id} value={location.id}>
										<ListboxLabel>{location.name}</ListboxLabel>
									</ListboxOption>
								))}
						</Listbox>
					</Field>
					<Field>
						<Label>Phone Number</Label>
						<Input defaultValue={edit?.phone} name="phone" />
					</Field>
					<Field>
						<Label>Email</Label>
						<Input type="email" defaultValue={edit?.email} name="email" />
					</Field>
					<Field>
						<Label>Website</Label>
						<Input type="url" defaultValue={edit?.website} name="website" />
					</Field>
					<Field>
						<Label>School Visibility</Label>
						<Listbox defaultValue={edit?.isPublic ? "true" : "false"} name="isPublic">
							<ListboxOption key="true" value="true">
								<ListboxLabel>Public</ListboxLabel>
								<ListboxDescription>Visible to everyone with or without an account</ListboxDescription>
							</ListboxOption>
							<ListboxOption key="false" value="false">
								<ListboxLabel>Private</ListboxLabel>
								<ListboxDescription>Only visible to the management</ListboxDescription>
							</ListboxOption>
						</Listbox>
					</Field>
				</form>
				<Description className="mt-6">Cover Image</Description>
				<Divider className="mb-6 mt-2" />
				<form ref={formRef} className="mt-6">
					<div className="aspect-[3/2] w-full">
						<img alt=" " className="aspect-[3/2] min-h-full w-full !overflow-hidden rounded-lg object-cover shadow" src={url} />
					</div>
					<input accept=".jpg,.jpeg,.gif,.png" name="file" ref={inputRef} type="file" className="hidden" onChange={onImageUpdate} />
				</form>
				<div className="mt-4 flex flex-row gap-4">
					<Button disabled={isLoading} onClick={() => (inputRef.current as HTMLInputElement)?.click()}>
						Select {edit?.cover && "new"} image
					</Button>
					{(edit?.cover || isLoading) && (
						<Button plain disabled={isLoading} onClick={removeCoverImageHandler} type="submit" form="update">
							{!isLoading ? "Remove Picture" : "Loading..."}
						</Button>
					)}
				</div>
			</DialogBody>
			<DialogActions>
				<Button plain disabled={isLoading} onClick={() => onClose(searchParams, router)}>
					Cancel
				</Button>
				<Button disabled={isLoading} loading={isLoading} type="submit" form="update">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function AddSchoolModal() {
	const { data: authSession } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function createSchoolHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await addSchool(formData);
		if (res?.ok) {
			onClose(searchParams, router);
			updateSearchParams({ "edit-school": res?.id }, router);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams.has("add-school") && authorize(authSession, [s.management]);

	return (
		<Dialog onClose={() => onClose(searchParams, router)} open={isOpen as boolean}>
			<DialogTitle>Add New School</DialogTitle>
			<DialogDescription>A School Needs to be public to be able to selected by students.</DialogDescription>
			<DialogBody>
				{/*@ts-ignore Server Action*/}
				<form id="add" action={createSchoolHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input required name="name" />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={() => onClose(searchParams, router)}>
					Cancel
				</Button>
				<Button disabled={isLoading} type="submit" form="add">
					Next
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function DeleteSchoolModal({ school, total }) {
	const { data: authSession, status } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pageInteger = parseInt(searchParams.get("page"));

	const [isLoading, setIsLoading] = useFlushState(false);

	async function deleteSchoolHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		formData.append("id", school?.id);
		const res = await deleteSchool(formData);
		const isChange = (total - 1) % 10 === 0;
		if (res?.ok) {
			toast.success(res?.message);
			if (isChange && pageInteger == Math.ceil(total / 10)) {
				const page = pageInteger ? pageInteger - 1 : 1;
				updateSearchParams({ "delete-school": "", page: page });
			}
			onClose(searchParams, router);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	const isOpen = searchParams.has("delete-school") && status === "authenticated" && authorize(authSession, [s.management]);

	if (!school) return null;

	return (
		<Dialog onClose={() => onClose(searchParams, router)} open={isOpen as boolean}>
			<DialogTitle>Delete {school.name}</DialogTitle>
			<DialogDescription>This action cannot be undone.</DialogDescription>
			<DialogBody>
				{/* @ts-ignore Server Action */}
				<form id="delete" action={deleteSchoolHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Password</Label>
						<Input autoFocus required type="password" name="password" />
					</Field>
				</form>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={() => onClose(searchParams, router)}>
					Cancel
				</Button>
				<Button color="red" disabled={isLoading} type="submit" form="delete">
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
