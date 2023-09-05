"use client";

import { signIn, getSession, signOut } from "next-auth/react";

import { useEffect, useState, useRef } from "react";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { resetPassword } from "./reset-password.server";

export default function Login() {
	const { toast } = useToast();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isHelp, setIsHelp] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [currentEmail, setCurrentEmail] = useState("");

	let enteredEmail;
	let enteredPassword;
	const credentials = useRef();

	function Divider() {
		return (
			<>
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="rounded-lg bg-background px-2 text-muted-foreground">TROUBLE LOGGING IN?</span>
					</div>
				</div>
			</>
		);
	}

	async function submitHandler(e) {
		e.preventDefault();
		const formData = new FormData(credentials.current);
		enteredEmail = formData.get("username");
		enteredPassword = formData.get("password");
		if (enteredEmail.trim() === "" || enteredPassword.trim() === "") {
			setIsLoading(true);
			toast({
				title: "Invalid input",
				description: "Please enter a valid email and password.",
				variant: "destructive",
			});
			await new Promise((resolve) => setTimeout(resolve, 1500));
			setIsLoading(false);
			return;
		}
		refetch();
	}

	const { refetch, isFetching } = useQuery({
		queryKey: ["login"],
		queryFn: async () => {
			const response = await signIn("credentials", {
				redirect: false,
				email: enteredEmail,
				password: enteredPassword,
			});
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
					title: "Welcome back!",
					description: "You've been successfully logged in.",
					variant: "default",
				});
				router.push("/medibook");
			}
		},
		enabled: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		retry: false,
	});

	let email;
	useEffect(() => {
		setIsHelp(searchParams.get("help") == "");
		setCurrentEmail(searchParams.get("email"));
	}, [searchParams]);

	return (
		<div className="py-auto flex h-[100%] w-[350px] flex-col justify-center px-[10px] align-middle">
			<div className="mb-5 flex flex-col space-y-2 text-center">
				{email}
				<div className="mx-auto flex flex-row">
					{!isHelp ? (
						<h1 className="p-3 text-2xl font-semibold tracking-tight">
							Log In to<span className="sr-only">MediBook</span>
						</h1>
					) : (
						<h1 className="p-3 text-2xl font-semibold tracking-tight">Reset Your Password</h1>
					)}
					{!isHelp && <Image alt="MediBook Logo" className="my-auto" src="/assets/branding/logos/medibook-logo-white-1.svg" width={128} height={30} />}
				</div>
				<p className="text-sm duration-500 md:text-muted-foreground">
					{isHelp ? "Please provide your email. If it's linked to your account, you'll receive a password reset email." : "Enter your email, username or user id below"}
				</p>
			</div>
			{isHelp ? (
				<form action={resetPassword}>
					<div className="flex flex-col gap-2">
						<Label className="sr-only" htmlFor="email">
							Email
						</Label>
						<Input
							className="text-center text-lg"
							id="email"
							name="email"
							placeholder="Enter Your Email"
							type="email"
							autoCapitalize="none"
							autoCorrect="off"
							disabled={isFetching}
						/>
						<Button disabled={isFetching || isLoading} className="my-3 bg-[var(--medired)]">
							{(isFetching || isLoading) && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
							RESET PASSWORD
						</Button>
					</div>
				</form>
			) : (
				<form ref={credentials} onSubmit={submitHandler}>
					<div className="flex flex-col gap-2">
						<Label className="sr-only" htmlFor="username">
							Username
						</Label>
						<Input
							defaultValue={currentEmail}
							onChange={(e) => {
								setCurrentEmail(e.target.value.toLowerCase().trim());
							}}
							className="text-center text-lg md:text-sm"
							id="username"
							name="username"
							placeholder="Email, Username or User-ID"
							type="username"
							autoCapitalize="none"
							autoCorrect="off"
							disabled={isFetching || isLoading}
						/>
						<Label className="sr-only" htmlFor="password">
							Password
						</Label>
						<Input
							className="text-center text-lg md:text-sm"
							id="password"
							name="password"
							placeholder="Password"
							type="password"
							autoCapitalize="none"
							autoComplete="password"
							autoCorrect="off"
							disabled={isFetching || isLoading}
						/>
						<Button disabled={isFetching || isLoading} className="my-3 bg-[var(--medired)]">
							{(isFetching || isLoading) && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
							LOG IN
						</Button>
					</div>
				</form>
			)}
			<Divider />
			<div className="mt-3 flex flex-row gap-2">
				<Button disabled={isFetching || isLoading} onClick={() => router.push(`${isHelp ? "/login" : "/login?help"}`)} className="w-full" href="/loginhelp">
					{isHelp ? "LOG IN" : "RESET PASSWORD"}
				</Button>
				<Button disabled={isFetching || isLoading} onClick={() => router.push("/signup")} className="w-full" href="/signup">
					SIGN UP
				</Button>
			</div>
			<p className="my-3 text-center text-sm text-muted-foreground">
				By clicking continue, you agree to our
				<br />
				<Link href="/terms" className="underline underline-offset-4 hover:text-primary">
					Terms of Service
				</Link>{" "}
				and{" "}
				<Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
					Privacy Policy
				</Link>
				.
			</p>
		</div>
	);
}
