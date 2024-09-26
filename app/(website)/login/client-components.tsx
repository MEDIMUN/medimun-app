"use client";

import { Divider } from "@/components/divider";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";
import EsLogo from "@/public/assets/branding/logos/eslogo.svg";
import Logo from "@/public/assets/branding/logos/logo-white.svg";
import { Input } from "@/components/input";
import { redirect, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "./action";
import { toast } from "sonner";
import { Button } from "@/components/button";
import { updateSearchParams } from "@/lib/searchParams";
import { Field, Label } from "@/components/fieldset";

function OrSpacer() {
	return (
		<div className="my-4 flex justify-stretch gap-1">
			<Divider className="my-auto w-[40%]" />
			<p className="-bg-content1 mx-auto rounded-full px-3 text-xs tracking-widest">OR</p>
			<Divider className="my-auto w-[40%]" />
		</div>
	);
}

export default function LoginForm({ allowLogin }) {
	const [isLoading, setIsLoading] = useState(false);

	const searchParams = useSearchParams();

	async function handleSignIn(formData: FormData) {
		setIsLoading(true);
		const afterLogin = searchParams?.get("after-login");
		const res = await signIn(formData);
		if (!res?.ok) toast.error(res?.message);
		if (res?.ok) toast.success(res?.message);
		setIsLoading(false);
		if (res?.firstLogin) redirect(`/medibook/account?first-login=true${afterLogin ? `&after-login=${afterLogin}` : ""}`);
		redirect(afterLogin || `/medibook`);
	}
	return (
		<>
			{searchParams?.get("type") === "englishschool" && (
				<>
					<div className="mx-auto h-14 w-[210px] md:mx-0">
						<Link href="/">
							<Image alt="The English School Logo" src={EsLogo} fill className="!relative" />
						</Link>
					</div>
					<form className="mt-8" action={handleSignIn}>
						<Field>
							<Label>Username</Label>
							<Input className="mb-5 animate-appearance-in delay-150" name="username" placeholder="s181143@englishschool.ac.cy" />
						</Field>
						<Input className="mb-5 animate-appearance-in delay-300" name="password" placeholder="At least 8 characters" type="password" />
						<Link
							target="_blank"
							href="https://ca.englishschool.ac.cy"
							className="-mx-auto mb-5 ml-1 cursor-pointer text-xs text-content3-foreground hover:text-primary">
							Forgot Password?
						</Link>
						<Button disabled={allowLogin == "false"} className="w-full bg-[#383f9a] text-white">
							{allowLogin == "false" ? "Login Disabled" : "Login"}
						</Button>
						<OrSpacer />
						<Button className="w-full" href="/login" type="submit">
							<p className="-translate-x-2">Login with MediBook</p>
						</Button>
					</form>
				</>
			)}
			{searchParams.get("type") !== "englishschool" && (
				<>
					<div className="mx-auto h-14 w-[180px] md:mx-0">
						<Link href="/">
							<Image alt="MEDIMUN Logo" src={Logo} fill className="!relative" />
						</Link>
					</div>
					<form className="mt-8" action={handleSignIn}>
						<Field>
							<Label>Username</Label>
							<Input className="mb-5 animate-appearance-in delay-150" name="username" placeholder="Email, Username, or User ID" />
						</Field>
						<Field>
							<Label>Password</Label>
							<Input className="mb-5 animate-appearance-in delay-300" name="password" placeholder="At least 8 characters" type="password" />
						</Field>
						<Link href="/contact" className="-mx-auto ml-1 cursor-pointer text-xs text-content3-foreground hover:text-primary">
							Forgot Password?
						</Link>
						<Button disabled={allowLogin == "false" || isLoading} className={cn("mt-5 w-full")} type="submit" color="primary">
							{allowLogin == "false" ? "Login Disabled" : "Login"}
						</Button>
						<OrSpacer />
						<Button
							onClick={() => {
								updateSearchParams({ type: "englishschool" });
							}}
							disabled
							color="englishschool"
							className="w-full"
							type="submit">
							Login with The English School
						</Button>
					</form>
					<div className="mt-8 flex w-full animate-appearance-in justify-between rounded-small bg-content2 p-3">
						<p className="text-xs">Don&apos;t have an account?</p>
						<Link href="/signup" className="text-xs text-primary">
							Sign Up
						</Link>
					</div>
				</>
			)}
		</>
	);
}
