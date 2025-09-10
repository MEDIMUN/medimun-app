"use client";

import { cn } from "@/lib/cn";
import { Input } from "@/components/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Text } from "@/components/text";
import { useFlushState } from "@/hooks/use-flush-state";
import { resetPasswordFinal } from "./actions";
import { FastLink } from "@/components/fast-link";

export function ConfirmResetPasswordForm({ passwordResetCode }) {
	const [isLoading, , setIsLoading] = useFlushState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const router = useRouter();

	async function handleChangePassword(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		formData.append("passwordResetCode", passwordResetCode);
		const res = await resetPasswordFinal(formData);
		if (res?.ok) {
			toast.success(...res?.message);
			router.push("/login");
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isPasswordAtLeast8Characters = password.length >= 8;
	const isPasswordContainUppercase = /[A-Z]/.test(password);
	const isPasswordContainLowercase = /[a-z]/.test(password);
	const isPasswordContainNumber = /[0-9]/.test(password);
	const isPasswordContainSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
	const isPasswordValid =
		isPasswordAtLeast8Characters &&
		isPasswordContainUppercase &&
		isPasswordContainLowercase &&
		isPasswordContainNumber &&
		isPasswordContainSpecialCharacter;
	const doPasswordsMatch = password === confirmPassword;

	return (
		<>
			<form action={handleChangePassword} className="flex h-[calc(100%-56px)] flex-col">
				<Text className="mt-5">Create a new password.</Text>
				<Field className="mt-5">
					<Label>Password</Label>
					<ul className="mb-3 ml-4 mt-2 list-outside list-disc text-xs">
						<Text className={cn("text-xs! text-primary! duration-150", isPasswordAtLeast8Characters && "text-green-500!")} as="li">
							At least 8 characters long.
						</Text>
						<Text className={cn("text-xs! text-primary! duration-150", isPasswordContainUppercase && "text-green-500!")} as="li">
							Must contain at least one uppercase letter.
						</Text>
						<Text className={cn("text-xs! text-primary! duration-150", isPasswordContainLowercase && "text-green-500!")} as="li">
							Must contain at least one lowercase letter.
						</Text>
						<Text className={cn("text-xs! text-primary! duration-150", isPasswordContainNumber && "text-green-500!")} as="li">
							Must contain at least one number.
						</Text>
						<Text className={cn("text-xs! text-primary! duration-150", isPasswordContainSpecialCharacter && "text-green-500!")} as="li">
							Must contain at least one special character.
						</Text>
						<Text className={cn("text-xs! text-primary! duration-150", doPasswordsMatch && password && "text-green-500!")} as="li">
							Passwords must match.
						</Text>
					</ul>
					<Input
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						className="animate-appearance-in delay-150"
						name="password"
						type="password"
						placeholder="Password"
					/>
				</Field>
				<Input
					onChange={(e) => setConfirmPassword(e.target.value)}
					value={confirmPassword}
					type="password"
					className="mt-5 animate-appearance-in delay-200"
					placeholder="Confirm Password"
				/>
				<Button
					type="submit"
					loading={isLoading}
					className="mt-5 w-full"
					color="primary"
					disabled={!isPasswordValid || !doPasswordsMatch || isLoading}>
					Continue
				</Button>
			</form>
			<div className="mt-4 flex w-full animate-appearance-in justify-between rounded-small bg-content2 p-3">
				<p className="text-xs">Want to login instead?</p>
				<FastLink href="/login" className="text-xs text-primary">
					Back to Login
				</FastLink>
			</div>
		</>
	);
}
