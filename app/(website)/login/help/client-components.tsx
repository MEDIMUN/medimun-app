"use client";

import { Divider } from "@/components/divider";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";
import EsLogo from "@/public/assets/branding/logos/eslogo.svg";
import Logo from "@/public/assets/branding/logos/logo-white.svg";
import { Input } from "@/components/input";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/button";
import { updateSearchParams } from "@/lib/search-params";
import { Field, Label } from "@/components/fieldset";
import { resetPassword } from "./actions";
import { Text } from "@/components/text";
import { useFlushState } from "@/hooks/use-flush-state";

function OrSpacer() {
	return (
		<div className="my-4 flex justify-stretch gap-1">
			<Divider className="my-auto w-[40%]" />
			<p className="-bg-content1 mx-auto rounded-full px-3 text-xs tracking-widest">OR</p>
			<Divider className="my-auto w-[40%]" />
		</div>
	);
}

export default function ResetPasswordForm() {
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

	return (
		<div className="flex h-full flex-col">
			<div className="mx-auto h-14 w-[180px] md:mx-0">
				<Link href="/">
					<Image alt="MEDIMUN Logo" src={Logo} fill className="!relative" />
				</Link>
			</div>
			<form className="mt-8" action={handleSignIn}>
				<Text>
					Enter your username to reset your password. You will receive an email with instructions on how to reset your password if an account with
					that username exists.
				</Text>
				<Field className="mt-5">
					<Label>Username</Label>
					<Input className="mb-5 animate-appearance-in delay-150" name="username" placeholder="Email, Username, or User ID" />
				</Field>
				<Button loading={isLoading} disabled={isLoading} className={cn("mt-2 w-full")} type="submit" color="primary">
					Reset Password
				</Button>
			</form>
			<div className="mt-auto flex w-full animate-appearance-in justify-between rounded-small bg-content2 p-3">
				<p className="text-xs">Want to login instead?</p>
				<Link href="/login" className="text-xs text-primary">
					Back to Login
				</Link>
			</div>
		</div>
	);
}
