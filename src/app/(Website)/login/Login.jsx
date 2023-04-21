"use client";

import { signIn, getSession, signOut } from "next-auth/react";

import { useEffect, useState, useRef } from "react";
import style from "./Login.module.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
	const emailInputRef = useRef();
	const passwordInputRef = useRef();

	let enteredEmail;
	let enteredPassword;

	async function submitHandler() {
		enteredEmail = emailInputRef.current.value;
		enteredPassword = passwordInputRef.current.value;
		refetch();
	}

	const { data, error, refetch, isError, isLoading } = useQuery({
		queryKey: ["signIn"],
		queryFn: async () => {
			const response = await signIn("credentials", {
				redirect: false,
				email: enteredEmail,
				password: enteredPassword,
			});
			if (!response.ok) {
				throw new Error(response);
			}
			return response;
		},
		enabled: false,
		refetchOnWindowFocus: false,
	});

	return (
		<div className={style.login}>
			<div className="h-[100%] px-[25px] py-auto w-auto flex-col flex justify-center align-middle">
				<Input ref={emailInputRef} className="focus-visible:outline-none focus-visible:ring-offset-0 my-3 text-white rounded-none border-b-2 border-t-0 border-l-0 border-r-0 w-[100%] focus-visible:border-b-2 focus-visible:border-b-[var(--medired)] focus-visible:ring-0" type="username" placeholder="Username or Email" />
				<Input ref={passwordInputRef} className="focus-visible:outline-none focus-visible:ring-offset-0 my-3 text-white rounded-none border-b-2 border-t-0 border-l-0 border-r-0 w-[100%] focus-visible:border-b-2 focus-visible:border-b-[var(--medired)] focus-visible:ring-0" type="password" placeholder="Password" />
				<Button onClick={submitHandler} className="w-[200px] rounded-[50px] ml-auto mt-6">
					{isLoading ? "Loading..." : "Sign in"}
				</Button>
				<span onClick={signOut} className="text-stone-400 hover:text-[var(--medired)] py-1 px-3 rounded-[100px] ml-auto hover:cursor-pointer hover:bg-slate-200 mt-1 text-sm text-right">
					Reset password
				</span>
				<span className="text-stone-400 hover:text-[var(--medired)] py-1 px-3 rounded-[100px] ml-auto hover:cursor-pointer hover:bg-slate-200 mt-1 text-sm text-right">Create an account</span>
			</div>
		</div>
	);
}
