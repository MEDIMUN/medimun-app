"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export default function Login() {
	return (
		<div>
			<div className="py-auto flex h-[100%] w-auto flex-col justify-center px-[40px] align-middle">
				<Input
					autoCapitalize="off"
					className="my-3 w-[100%] rounded-none border-b-2 border-l-0 border-r-0 border-t-0 text-base text-white focus-visible:border-b-2 focus-visible:border-b-[var(--medired)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
					type="username"
					placeholder="Email, Username or UserID"
				/>
				<Input
					className="my-3 w-[100%] rounded-none border-b-2 border-l-0 border-r-0 border-t-0 text-base text-white focus-visible:border-b-2 focus-visible:border-b-[var(--medired)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
					type="password"
					placeholder="Password"
				/>
				<Button className="rounded-2 mx-auto mt-6 w-[80%] bg-[var(--medired)]">Log in</Button>
				<div className="mx-auto mt-3">
					<span className="mx-auto ml-auto rounded-[100px] px-3 py-1 text-right text-sm text-stone-400 hover:cursor-pointer hover:bg-slate-200 hover:text-[var(--medired)]">
						Reset password
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
