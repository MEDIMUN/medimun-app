import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AuthRedirect(props) {
	const session = await getServerSession(authOptions);
	if (session && props.authenticated) {
		redirect(props.authenticated);
	}
	if (!session && props.unauthenticated) {
		redirect(props.unauthenticated);
	}
	return <></>;
}

export const revalidate = 0;

/* 
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthRedirect(props) {
	const router = useRouter();
	const { status } = useSession();
	useEffect(() => {
		if (status === "authenticated" && props.authenticated) {
			router.push(props.authenticated);
		}
		if (status === "unauthenticated" && props.unauthenticated) {
			router.push(props.unauthenticated);
		}
	}, [status]);
	return <></>;
}
 */
