"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { deleteProfilePictureForUser, updateProfilePictureForUser } from "../../../@userModals/actions";
import { Button } from "@heroui/button";
import { Pencil, Plus } from "lucide-react";

export function ProfileUploader({ user }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [url, setUrl] = useState(`/api/users/${user?.id}/avatar`);
	const ref = useRef();
	const formRef = useRef();

	async function removeProfilePictureHandler() {
		setLoading(true);
		const res = await deleteProfilePictureForUser(user?.id);
		if (res?.ok) {
			router.refresh();
			setUrl("");
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setLoading(false);
	}

	const onImageUpdate = async (e) => {
		const profilePicture = e.target.files[0];
		if (!profilePicture) return toast.error("Profile Picture is required");
		if (profilePicture.size > 10000000) return toast.error("The maximun file size is 10MB");
		if (!["image/png", "image/gif", "image/jpeg"].includes(profilePicture.type)) return toast.error("File type is not supported");

		setUrl(URL.createObjectURL(e.target.files[0]));

		const formData = new FormData(formRef.current);

		flushSync(() => {
			setLoading(true);
		});
		const res = await updateProfilePictureForUser(user.id, formData);

		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setLoading(false);
	};

	return (
		<>
			<Card className="bg-default-100" shadow="none">
				<CardBody>
					<div className="flex items-center gap-4">
						<Badge
							classNames={{
								badge: "w-5 h-5",
							}}
							content={
								<Button disabled={loading} onPress={() => ref.current.click()} className="h-5 w-5 min-w-5 bg-background p-0 text-default-500">
									{user?.profilePicture ? <Pencil className="h-[9px] w-[9px]" /> : <Plus className="h-[10px] w-[10px]" width={25} />}
								</Button>
							}
							placement="bottom-right"
							shape="circle">
							<Avatar
								isDisabled={loading}
								as={Button}
								radius="full"
								onPress={ref?.current?.click}
								isLoading={loading}
								isIconOnly
								className="h-16 w-16 rounded-full"
								src={url}
								showFallback
							/>
						</Badge>
						<div>
							<form ref={formRef}>
								<input accept=".jpg,.jpeg,.gif,.png" name="profilePicture" ref={ref} type="file" className="hidden" onChange={onImageUpdate} />
							</form>
							<p className="text-sm font-medium text-default-600">{user?.displayName || `${user?.officialName} ${user?.officialSurname}`}</p>
							<p className="text-xs text-default-400">{user?.Student?.name}</p>
							{user?.profilePicture && (
								<Link className="mt-1 cursor-pointer text-xs" isDisabled={loading} onPress={removeProfilePictureHandler}>
									{!loading ? "Remove Picture" : "Loading..."}
								</Link>
							)}
						</div>
					</div>
				</CardBody>
			</Card>
		</>
	);
}
