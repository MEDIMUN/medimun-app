"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function NavOptions() {
	async function handleSignOut() {
		signOut({ callbackUrl: "/login" });
	}
	return (
		<div>
			<Button onClick={handleSignOut}>Sign Out</Button>
		</div>
	);
}
