"use client";

import { Description, ErrorMessage, Field } from "@/components/fieldset";
import { Subheading } from "@/components/heading";
import Icon from "@/components/icon";
import { Input, InputGroup } from "@/components/input";
import { Code, Text } from "@/components/text";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { checkUsername, clearBio, deletePrivateProfilePicture, updatePrivateProfilePicture } from "./actions";
import { Button } from "@/components/button";
import { useRouter, useSearchParams } from "next/navigation";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/badge";

export function UsernameField({ initialUsername }) {
	const [isLoading, setIsLoading] = useState(false);
	const [query, setQuery] = useState(initialUsername);
	const [debouncedValue] = useDebouncedValue(query, 800);
	const [isValid, setIsValid] = useState(false);
	const [isChecked, setIsChecked] = useState(false);

	useEffect(() => {
		async function handleCheckUsername() {
			if (debouncedValue?.length < 7) return;
			setIsLoading(true);
			const { response } = await checkUsername(debouncedValue);
			setIsValid(response);
			setIsChecked(true);
			setIsLoading(false);
		}
		handleCheckUsername();
	}, [debouncedValue]);

	useEffect(() => {
		setIsValid(false);
		setIsChecked(false);
	}, [query]);

	function handleOnChange(e) {
		let value = e.target.value;
		value = value.replace(/ /g, "_");
		value = value.replace("__", "_");
		value = value.replace(/\W/g, "");
		//if first character is _ remove it
		if (value.charAt(0) === "_") value = value.slice(1);
		setQuery(value.toLowerCase());
	}

	const isSubmittable = isValid || initialUsername == query;

	return (
		<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
			<div className="space-y-1">
				<Subheading>
					Username <Code color="yellow">Optional</Code>
				</Subheading>
				<Text>Your handle on the platform. Will be visible to everyone. </Text>
			</div>
			<div className="my-auto">
				<Field>
					<InputGroup>
						{isLoading && <Icon data-slot="icon" className="animate-spin" icon="gg:spinner" />}
						<Input
							name="username"
							type="search"
							value={query}
							onChange={(e) => handleOnChange(e)}
							disabled={isLoading}
							pattern={isSubmittable ? ".*" : "$^"}
							minLength={isSubmittable ? 0 : 6}
							maxLength={20}
						/>
					</InputGroup>
					{!isValid && query && initialUsername !== query && query.length > 6 && isChecked && <ErrorMessage>Username is already taken</ErrorMessage>}
					{query && query.length < 7 && initialUsername !== query && <ErrorMessage>Username must be at least 6 characters</ErrorMessage>}
					{query && isValid && initialUsername !== query && <Description>Username is valid</Description>}
				</Field>
			</div>
		</section>
	);
}

export function ClearBioButton() {
	const router = useRouter();
	async function handleClearBio() {
		const res = await clearBio();
		if (res?.ok) {
			router.refresh();
			router.replace(`/medibook/account?success=${res.message}#notice`);
			window.location.reload();
		}
	}
	return (
		<Field className="w-full flex-1 flex-row gap-6">
			<Button className="mb-auto mt-2 w-full rounded-full" color="red" onClick={handleClearBio}>
				Clear biography
			</Button>
		</Field>
	);
}

export function PrivateProfilePictureUploader({ user }) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { data: authSession } = useSession();
	const [url, setUrl] = useState(user.profilePicture ? `/api/users/${user.id}/avatar` : "/placeholders/pfp.jpg");
	const [isLoading, setIsLoading] = useState(false);

	async function removeProfilePictureHandler() {
		setIsLoading(true);
		const res = await deletePrivateProfilePicture();
		if (res?.ok) {
			router.refresh();
			setUrl("");
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
		window.location.reload();
	}

	async function onImageUpdate(e) {
		const coverImage = e.target.files[0];
		if (!coverImage) return toast.error("Profile Picture is required");
		if (coverImage.size > 5000000) return toast.error("The maximun file size is 5MB");
		if (!["image/png", "image/gif", "image/jpeg"].includes(coverImage.type)) return toast.error("File type is not supported");
		setUrl(URL.createObjectURL(e.target.files[0]));
		const formData = new FormData(formRef.current);
		formData.append("id", user?.id);
		flushSync(() => {
			setIsLoading(true);
		});
		const res = await updatePrivateProfilePicture(formData);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	return (
		<div className="flex min-w-full flex-col gap-5 md:flex-row">
			<form ref={formRef} className="w-full">
				<div className="aspect-square w-full md:w-32">
					<img alt=" " className="aspect-square min-h-full w-full !overflow-hidden rounded-2xl object-cover shadow" src={url} />
				</div>
				<input accept=".jpg,.jpeg,.gif,.png" name="file" ref={inputRef} type="file" className="hidden" onChange={onImageUpdate} />
			</form>
			<div className="my-auto flex w-full flex-col gap-4">
				<Button className="min-w-max cursor-pointer" disabled={isLoading} onClick={() => (inputRef.current as HTMLInputElement)?.click()}>
					Select {user?.profilePicture && "new"} image
				</Button>
				{(user?.profilePicture || isLoading) && (
					<Button
						className="min-w-max cursor-pointer"
						color={!isLoading && "red"}
						disabled={isLoading}
						plain={isLoading}
						onClick={removeProfilePictureHandler}
						type="submit"
						form="update">
						{!isLoading ? "Remove Picture" : "Loading..."}
					</Button>
				)}
			</div>
		</div>
	);
}
