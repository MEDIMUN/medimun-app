"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resetPassword } from "../_actions/forgot-password";
import { useFlushState } from "@/hooks/use-flush-state";
import Form from "next/form";
import { FastLink } from "@/components/fast-link";

export function ResetPasswordForm() {
	const [isLoading, , setIsLoading] = useFlushState(false);

	const router = useRouter();

	async function handleSignIn(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await resetPassword(formData);
		if (res?.ok) {
			toast.success(...res?.message);
			router.push("/login");
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	function cn(...classes: (string | undefined)[]): string {
		return classes.filter(Boolean).join(" ");
	}
	return (
		<Form action={handleSignIn} className={"flex light flex-col gap-6"}>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">Reset Your Password</h1>
				<p className="text-pretty text-sm text-muted-foreground">You will receive an email with a link to reset your password.</p>
			</div>
			<div className="grid gap-6">
				<div className="grid gap-2">
					<Label htmlFor="username">Username</Label>
					<Input name="username" id="username" type="username" placeholder="Email, Username or UserID" required />
				</div>
				<Button disabled={isLoading} type="submit" className="w-full bg-white">
					Reset Password
				</Button>
			</div>
			<div className="text-center text-sm">
				Suddenly remembered your password?{" "}
				<FastLink href="/login" className="underline underline-offset-4">
					Login
				</FastLink>
			</div>
		</Form>
	);
}
