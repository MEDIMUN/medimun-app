"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useSearchParams, useRouter } from "next/navigation";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { deleteCoverImage, editLocation, updateCoverImage } from "./actions";
import { countries } from "@/data/countries";
import { SlugInput } from "@/components/slugInput";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/useFlushState";
import { removeSearchParams } from "@/lib/searchParams";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { flushSync } from "react-dom";
import { useEffect, useRef } from "react";
import { Divider } from "@/components/divider";

export function EditLocationModal({ edit }) {
	const { data: session, status } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();

	const [isLoading, setIsLoading] = useFlushState(false);
	const [url, setUrl] = useFlushState("/placeholders/cover.jpg");
	const formRef = useRef(null);
	const inputRef = useRef();

	async function removeCoverImageHandler() {
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
		if (coverImage.size > 5000000) return toast.error("The maximun file size is 5MB");
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

	async function editLocationHandler(formData: FormData) {
		setIsLoading(true);
		formData.append("id", edit?.id);
		const res = await editLocation(formData);
		if (res?.ok) {
			toast.success(res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	useEffect(() => {
		if (edit?.cover) {
			setUrl(`/api/locations/${edit?.id}/cover`);
		} else {
			setUrl("/placeholders/cover.jpg");
		}
	}, [edit, setUrl]);

	function onClose() {
		if (searchParams.has("return")) {
			router.push(searchParams.get("return") as string);
		} else {
			removeSearchParams({ "create-location": "", "edit-location": "", "delete-location": "", return: "" }, router);
		}
	}

	const isOpen = searchParams.has("edit-location") && status === "authenticated" && authorize(session, [s.management]);

	return (
		<Dialog onClose={onClose} open={isOpen as boolean}>
			<DialogTitle>{edit?.name}</DialogTitle>
			<DialogBody>
				{/* @ts-ignore Server Action */}
				<form id="update" action={editLocationHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Name</Label>
						<Input required defaultValue={edit?.name} name="name" />
					</Field>
					<Field>
						<Label>Slug</Label>
						<SlugInput defaultValue={edit?.slug} name="slug" />
					</Field>
					<Field>
						<Label>Street Address</Label>
						<Input type="text" defaultValue={edit?.street} name="street" />
					</Field>
					<Field>
						<Label>City</Label>
						<Input type="text" defaultValue={edit?.city} name="city" />
					</Field>
					<Field>
						<Label>State</Label>
						<Input type="text" defaultValue={edit?.state} name="state" />
					</Field>
					<Field>
						<Label>Zip Code</Label>
						<Input type="text" maxLength={10} defaultValue={edit?.zipCode} name="zipCode" />
					</Field>
					<Field>
						<Label>Country</Label>
						<Listbox defaultValue={edit?.country} name="country">
							{countries.map((country) => (
								<ListboxOption key={country.countryCode} value={country.countryCode}>
									<img className="w-5 sm:w-4" src={`https://flagcdn.com/40x30/${country.countryCode.toLowerCase()}.webp`} alt="" />
									<ListboxLabel>{country.countryNameEn}</ListboxLabel>
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
						<Label>Location Visibility</Label>
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
				<Button plain disabled={isLoading} onClick={onClose}>
					Cancel
				</Button>
				<Button disabled={isLoading} type="submit" form="update">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}
