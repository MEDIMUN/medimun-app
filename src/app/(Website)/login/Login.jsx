"use client";

import { signIn, getSession, signOut } from "next-auth/react";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Login() {
	const emailInputRef = useRef();
	const passwordInputRef = useRef();
	const { toast } = useToast();
	const { data: session, status } = useSession();
	const router = useRouter();

	let enteredEmail;
	let enteredPassword;

	async function submitHandler() {
		enteredEmail = emailInputRef.current.value;
		enteredPassword = passwordInputRef.current.value;
		refetch();
	}

	const { data, error, refetch, isError, isFetching } = useQuery({
		queryKey: ["signIn"],
		queryFn: async () => {
			const response = await signIn("credentials", {
				redirect: false,
				email: enteredEmail,
				password: enteredPassword,
			});
			console.log(response);
			if (response.error) {
				toast({
					title: "We couldn't sign you in",
					description: response.error,
					variant: "destructive",
				});
				throw new Error(response);
			}
			if (!response.error) {
				toast({
					title: "Signed in",
				});
				router.push("/medibook");
			}
			return response;
		},
		enabled: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		retry: false,
	});

	return (
		<div>
			<div className="py-auto flex h-[100%] w-auto flex-col justify-center px-[40px] align-middle">
				<Input
					autoCapitalize="off"
					ref={emailInputRef}
					className="my-3 w-[100%] rounded-none border-b-2 border-l-0 border-r-0 border-t-0 text-base text-white focus-visible:border-b-2 focus-visible:border-b-[var(--medired)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
					type="username"
					placeholder="Email, Username or UserID"
				/>
				<Input
					ref={passwordInputRef}
					className="my-3 w-[100%] rounded-none border-b-2 border-l-0 border-r-0 border-t-0 text-base text-white focus-visible:border-b-2 focus-visible:border-b-[var(--medired)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
					type="password"
					placeholder="Password"
				/>
				<Button onClick={submitHandler} disabled={isFetching} className="rounded-2 mx-auto mt-6 w-[80%] bg-[var(--medired)]">
					Log in
				</Button>
				<div className="mx-auto mt-3">
					<span className="mx-auto ml-auto rounded-[100px] px-3 py-1 text-right text-sm text-stone-400 hover:cursor-pointer hover:bg-slate-200 hover:text-[var(--medired)]">
						<s>Reset password</s> <sup>coming soon</sup>
					</span>
					<Link
						href="signup"
						className="mx-auto ml-auto mt-1 rounded-[100px] px-3 py-1 text-right text-sm text-stone-400 hover:cursor-pointer hover:bg-slate-200 hover:text-[var(--medired)]">
						Create an account
					</Link>
				</div>
			</div>
		</div>
	);
}
