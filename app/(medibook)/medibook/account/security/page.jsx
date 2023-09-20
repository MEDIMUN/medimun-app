"use client";

import { useEffect, useState } from "react";
import { updatePassword } from "./update-password";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const checklistClass = "flex flex-row items-center text-center text-sm text-black w-full h-1/5 p-2 bg-gray-100 rounded-sm duration-500";

export default function Page() {
	const { toast } = useToast();
	const router = useRouter();
	const [form, setForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmNewPassword: "",
	});

	async function updatePasswordHandler() {
		if (
			!(
				/[A-Z]/.test(form.newPassword) &&
				/[a-z]/.test(form.newPassword) &&
				/[0-9]/.test(form.newPassword) &&
				/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(form.newPassword) &&
				form.newPassword.length > 7 &&
				form.newPassword === form.confirmNewPassword &&
				form.newPassword
			)
		) {
			toast({
				title: "Password is not valid",
				description: "Please check the password requirements and try again.",
				variant: "destructive",
			});
			return;
		}
		if (!form.currentPassword) {
			toast({
				title: "Current Password is required",
				variant: "destructive",
			});
			return;
		}
		const res = await updatePassword(form);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant || "default",
			});
		if (res?.ok) {
			setForm({
				currentPassword: "",
				newPassword: "",
				confirmNewPassword: "",
			});
		} else {
			if (res?.reset) {
				setForm({
					currentPassword: "",
					newPassword: "",
					confirmNewPassword: "",
				});
			} else {
				setForm({
					currentPassword: "",
				});
			}
		}
	}

	function handleOnChange(e) {
		setForm(
			(prev) =>
				(prev = {
					...form,
					[e.target.name]: e.target.value,
				})
		);
	}

	return (
		<div>
			<form action={updatePasswordHandler} className="mb-[400px] grid max-h-full gap-5 p-1 pt-0">
				<div className="flex flex-col gap-2">
					<label htmlFor="currentPassword">Current Password</label>
					<input
						value={form.currentPassword}
						onChange={handleOnChange}
						type="password"
						name="currentPassword"
						id="currentPassword"
						className="rounded-lg border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-200"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label htmlFor="newPassword">New Password</label>
					<input
						value={form.newPassword}
						onChange={handleOnChange}
						type="password"
						name="newPassword"
						id="newPassword"
						className="rounded-lg border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-200"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label htmlFor="confirmNewPassword">Confirm New Password</label>
					<input
						value={form.confirmNewPassword}
						onChange={handleOnChange}
						type="password"
						name="confirmNewPassword"
						id="confirmNewPassword"
						className="rounded-lg border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-200"
					/>
				</div>
				<div className="flex h-min w-full flex-col gap-2 rounded-md border-[1px] border-gray-200 bg-white p-2 text-center">
					<div className={checklistClass + " " + `${/[A-Z]/.test(form.newPassword) && "bg-green-500"}`}>At least one capital letter</div>
					<div className={checklistClass + " " + `${/[a-z]/.test(form.newPassword) && "bg-green-500"}`}>At least one lowercase letter</div>
					<div className={checklistClass + " " + `${/[0-9]/.test(form.newPassword) && "bg-green-500"}`}>At least one number</div>
					<div className={checklistClass + " " + `${/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(form.newPassword) && "bg-green-500"}`}>At least one special character</div>
					<div className={checklistClass + " " + `${form.newPassword.length > 7 && "bg-green-500"}`}>At least 8 characters long</div>
					<div className={checklistClass + " " + `${form.newPassword === form.confirmNewPassword && form.confirmNewPassword !== "" && "bg-green-500"}`}>Passwords must match</div>
				</div>
				<button type="submit" className="rounded-lg bg-gradient-to-r from-gray-700 via-gray-900 to-black p-2 px-5 text-white shadow-lg duration-300 hover:shadow-xl">
					Update Password
				</button>
			</form>
		</div>
	);
}
