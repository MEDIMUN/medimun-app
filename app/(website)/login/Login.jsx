"use client";

import { signIn } from "next-auth/react";

import { useEffect, useState, useRef } from "react";
import { Button, Input, Checkbox, Link, Divider } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "./reset-password.server";
import { Icon } from "@iconify/react";
import Logo from "@/components/website/Logo";

export default function Login(props) {
	const { toast } = useToast();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { currentSession } = props;

	const [isVisible, setIsVisible] = useState(false);

	const toggleVisibility = () => setIsVisible(!isVisible);

	let enteredEmail;
	let enteredPassword;

	async function submitHandler(e) {
		enteredEmail = e.get("username");
		enteredPassword = e.get("password");
		if (enteredEmail.trim() === "" || enteredPassword.trim() === "") {
			toast({
				title: "Invalid input",
				description: "Please enter a valid email and password.",
				variant: "destructive",
			});
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
				if (currentSession) router.push(`/medibook/sessions/${currentSession.number}`);
				if (!currentSession) router.push(`/medibook`);
			}
		},
		enabled: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		retry: false,
	});

	useEffect(() => {}, [searchParams]);

	return (
		<div
			className="flex h-screen w-screen items-center justify-center overflow-hidden bg-content1 p-2 sm:p-4 md:justify-end lg:p-8"
			style={{
				backgroundImage: "url(/assets/delegates-indoors-2.jpg)",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}>
			{/* Brand Logo */}
			<div className="absolute top-10 mx-auto md:left-10">
				<div className="flex items-center">
					<div className="w-52">
						<Logo size={40} color="red" />
					</div>
				</div>
			</div>
			{/* Login Form */}
			<div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
				<p className="pb-2 text-xl font-medium">Log In</p>
				<form className="flex flex-col gap-3" action={submitHandler}>
					<Input size="lg" label="Username" name="username" placeholder="Email, UserID or Username" type="text" variant="bordered" />

					<Input
						endContent={
							<button type="button" onClick={toggleVisibility}>
								{isVisible ? <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-closed-linear" /> : <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-bold" />}
							</button>
						}
						size="lg"
						label="Password"
						name="password"
						placeholder="Enter your password"
						type={isVisible ? "text" : "password"}
						variant="bordered"
					/>

					<div className="flex items-center justify-between px-1 py-2">
						<Checkbox name="remember" size="sm">
							Remember me
						</Checkbox>
						<Link className="text-default-500" href="#" size="sm">
							Forgot password?
						</Link>
					</div>
					<Button isLoading={isFetching} color="primary" type="submit">
						Log In
					</Button>
				</form>
				<p className="text-center text-small">
					Need to create an account?&nbsp;
					<Link href="#" size="sm">
						Sign Up
					</Link>
				</p>
			</div>
		</div>
	);
}
