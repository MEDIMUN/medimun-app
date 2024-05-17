"use client";

import { updateProfilePicture, removeProfilePicture } from "./profile-picture.js";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input, Button, ButtonGroup, Avatar } from "@nextui-org/react";
import { flushSync } from "react-dom";
import Image from "next/image";

export function Outer(props) {
	return <div className="flex w-full flex-col gap-2 p-4">{props.children}</div>;
}

export default function ProfileUploader({ user }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [url, setUrl] = useState(`/api/users/${user.id}/avatar`);
	const [profilePictureInput, setProfilePictureInput] = useState("");
	const { toast } = useToast();

	async function updateProfilePictureHandler(formData) {
		flushSync(() => {
			setLoading(true);
		});
		const res = await updateProfilePicture(formData);

		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant || "default",
			});
		if (res.ok) {
			router.push("/medibook/account");
		}
		window.location.reload();
		setLoading(false);
	}

	async function removeProfilePictureHandler() {
		setLoading(true);
		const res = await removeProfilePicture();
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant || "default",
			});
		if (res.ok) {
			setLoading(false);
			window.location.reload();
		}
		setLoading(false);
	}

	const onImageUpdate = (e) => {
		const profilePicture = e.target.files[0];
		if (!profilePicture) {
			toast({
				title: "Profile Picture is required",
				variant: "destructive",
			});
			return;
		}
		if (profilePicture.size > 10000000) {
			toast({
				title: "The maximun file size is 10MB",
				description: `You tried to upload a file of ${profilePicture.size / 1000000}MB.`,
				variant: "destructive",
			});
			return;
		}
		if (!["image/png", "image/gif", "image/jpeg"].includes(profilePicture.type)) {
			toast({
				title: "File type is not supported",
				description: "Please upload a file with the following extensions: png, gif, jpeg.",
				variant: "destructive",
			});
			return;
		}
		setProfilePictureInput(e.target.value);
		setUrl(URL.createObjectURL(e.target.files[0]));
	};

	return (
		<div className="mb-4 flex flex-col">
			<div className="flex">
				<Avatar isBordered color="danger" showFallback className="ml-1 mr-4 mt-1 aspect-square h-[134px] min-h-[134px] w-[134px] min-w-[134px] select-none object-cover" src={url} />
				<div className="flex flex-col gap-4 rounded-2xl p-4">
					{user.allowProfilePictureUpdate ? (
						<form id="pfpUpdater" action={updateProfilePictureHandler}>
							<input
								className="block w-full text-sm text-slate-500
      file:my-1 file:mr-4 file:rounded-full
      file:border-0 file:bg-violet-50
      file:px-4 file:py-2 file:text-sm
      file:font-semibold file:text-primary
      hover:file:bg-violet-100"
								accept=".jpg,.jpeg,.gif,.png"
								placeholder=" "
								size="lg"
								onChange={onImageUpdate}
								name="profilePicture"
								type="file"
							/>
						</form>
					) : (
						<div className="h-3" />
					)}
					<div className="flex gap-4">
						{user.profilePicture && (
							<Button isLoading={loading} onClick={removeProfilePictureHandler} isDisabled={loading} className="w-full" type="submit">
								{!loading ? "Remove" : "Loading"}
							</Button>
						)}
						{user.allowProfilePictureUpdate && (
							<Button isLoading={loading} form="pfpUpdater" disabled={loading} isDisabled={loading || !profilePictureInput} className="w-full" type="submit">
								{!loading ? "Upload" : "Uploading"}
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
