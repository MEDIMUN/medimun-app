"use client";

import { Label } from "@/components/ui/label";
import { updateProfilePicture, removeProfilePicture } from "./profile-picture";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

export default function Page() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [loading, setLoading] = useState(false);
	const [url, setUrl] = useState("");
	const [profilePictureInput, setProfilePictureInput] = useState("");
	const { toast } = useToast();

	async function updateProfilePictureHandler(formData) {
		setLoading((prev) => (prev = true));
		console.log(loading);
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
			router.push("/medibook/account/profile-picture");
		}
		setLoading(false);
		console.log(loading);
	}

	async function removeProfilePictureHandler() {
		setLoading((prev) => (prev = true));
		console.log(loading);
		const res = await removeProfilePicture();
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant || "default",
			});
		if (res.ok) {
			setLoading(false);
			router.push("/medibook/account/profile-picture");
		}
		setLoading(false);
		console.log(loading);
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
		console.log(loading);
	}, [loading]);

	if (status === "authenticated" && session.user)
		return (
			<>
				<div className="mb-4 w-min rounded-xl bg-gray-300 p-4">
					<Avatar className="h-[300px] w-[300px] shadow-xl">
						<AvatarImage className="object-cover" src={url} alt="@shadcn" />
						<AvatarFallback className="text-bold bg-white text-[100px]">{session.user.officialName[0] + session.user.officialSurname[0]}</AvatarFallback>
					</Avatar>
				</div>
				<div className="flex flex-col gap-2">
					<form action={updateProfilePictureHandler} className=" grid max-h-full gap-10 p-1 pt-0">
						<div className="flex flex-col gap-2">
							<Label htmlFor="profilePicture">Profile Picture (Optional)</Label>
							<p className="text-sm">
								Your profile picture will be visible to other users, offensive pictures will be removed and your account will be suspended. Max file size 10MB, supported formats
								png, gif, jpeg.
							</p>
							<Input value={profilePictureInput} onChange={(e) => onImageUpdate(e)} id="profilePicture" name="profilePicture" label="profilePicture" type="file" />
						</div>
						<Button disabled={loading} type="submit" className="justify-center">
							Save
						</Button>
					</form>
					<form action={removeProfilePictureHandler} className="mb-[400px] grid max-h-full gap-10 p-1 pt-0">
						<Button disabled={loading} type="submit" className="justify-center bg-red-500">
							Remove Profile Picture
						</Button>
					</form>
				</div>
			</>
		);

	return <div>Loading...</div>;
}
