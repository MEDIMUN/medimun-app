"use client";

import { Label } from "@/components/ui/label";
import { updateProfilePicture, removeProfilePicture } from "./profile-picture.js";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { flushSync } from "react-dom";

export default function ProfileUploader() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [loading, setLoading] = useState(false);
	const [url, setUrl] = useState("");
	const [profilePictureInput, setProfilePictureInput] = useState("");
	const { toast } = useToast();

	async function updateProfilePictureHandler(formData) {
		flushSync(() => {
			setLoading(true);
		});
		const profilePicture = formData.get("profilePicture");
		if (!profilePicture) {
			toast({
				title: "Profile Picture is required",
				variant: "destructive",
			});
			setLoading(false);
			return;
		}
		if (profilePicture.size > 10000000) {
			toast({
				title: "File size is too big",
				description: "Please upload a file smaller than 10MB.",
				variant: "destructive",
			});
			setLoading(false);
			return;
		}
		if (!["image/png", "image/gif", "image/jpeg"].includes(profilePicture.type)) {
			toast({
				title: "File type is not supported",
				description: "Please upload a file with the following extensions: png, gif, jpeg.",
				variant: "destructive",
			});
			setLoading(false);
			return;
		}

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
		setLoading(false);
	}

	async function removeProfilePictureHandler() {
		setLoading((prev) => (prev = true));
		const res = await removeProfilePicture();
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant || "default",
			});
		if (res.ok) {
			setLoading(false);
			router.refresh();
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

	useEffect(() => {
		if (status === "authenticated" && session.user) {
			setUrl(`/api/user/${session.user.id}/profilePicture`);
		}
	}, [status, session]);

	useEffect(() => {
		console.log("DDDDD", profilePictureInput);
	}, [profilePictureInput]);

	if (status === "authenticated" && session.user)
		return (
			<>
				<div className="mb-4 w-min rounded-xl bg-gray-300 p-4">
					<Avatar className="h-[calc(100vw-80px)] w-[calc(100vw-80px)] shadow-xl md:h-[300px] md:w-[300px]">
						<AvatarImage className="object-cover" src={url} alt="@shadcn" />
						<AvatarFallback className="text-bold bg-white text-[100px]">{session.user.officialName[0] + session.user.officialSurname[0]}</AvatarFallback>
					</Avatar>
				</div>
				<div className="flex flex-col gap-2">
					<form id="pfpUpdater" action={updateProfilePictureHandler} className=" grid max-h-full gap-10 pt-0">
						<div className="flex flex-col gap-2">
							<Label className="ml-2" htmlFor="profilePicture">
								Profile Picture (Optional)
							</Label>
							<Input value={profilePictureInput} onChange={(e) => onImageUpdate(e)} id="profilePicture" name="profilePicture" label="profilePicture" type="file" />
						</div>
					</form>
					<div className="flex gap-2 py-2">
						<Button onClick={removeProfilePictureHandler} disabled={loading} type="submit" className="justify-center bg-red-500">
							{!loading ? "Remove" : "Loading"}
						</Button>
						<Button form="pfpUpdater" disabled={loading} type="submit">
							{!loading ? "Update" : "Loading"}
						</Button>
					</div>
				</div>
			</>
		);
}
