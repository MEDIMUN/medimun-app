"use client";

import { signIn, getSession, signOut } from "next-auth/react";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
			<div className="h-[100%] px-[40px] py-auto w-auto flex-col flex justify-center align-middle">
				<Input autoCapitalize="off" ref={emailInputRef} className="text-base focus-visible:outline-none focus-visible:ring-offset-0 my-3 text-white rounded-none border-b-2 border-t-0 border-l-0 border-r-0 w-[100%] focus-visible:border-b-2 focus-visible:border-b-[var(--medired)] focus-visible:ring-0" type="username" placeholder="Email, Username or UserID" />
				<Input ref={passwordInputRef} className="text-base focus-visible:outline-none focus-visible:ring-offset-0 my-3 text-white rounded-none border-b-2 border-t-0 border-l-0 border-r-0 w-[100%] focus-visible:border-b-2 focus-visible:border-b-[var(--medired)] focus-visible:ring-0" type="password" placeholder="Password" />
				<Button onClick={submitHandler} disabled={isFetching} className="w-[80%] rounded-2 bg-[var(--medired)] mx-auto mt-6">
					Log in
				</Button>
				<div className="mx-auto mt-3">
					<span onClick={signOut} className="text-stone-400 hover:text-[var(--medired)] py-1 px-3 rounded-[100px] ml-auto hover:cursor-pointer hover:bg-slate-200 mx-auto text-sm text-right">
						Reset password
					</span>
					<span className="text-stone-400 hover:text-[var(--medired)] py-1 px-3 rounded-[100px] ml-auto hover:cursor-pointer hover:bg-slate-200 mx-auto mt-1 text-sm text-right">Create an account</span>
				</div>
			</div>
		</div>
	);
}
