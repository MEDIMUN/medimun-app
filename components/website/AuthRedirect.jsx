import { redirect } from "next/navigation";
import prisma from "@/prisma/client";
import { auth } from "@/auth";

export default async function AuthRedirect(props) {
	const session = await auth();

	if (session && props.authenticated) {
		const currentSession = await prisma.session
			.findFirst({
				where: { isCurrent: true },
				select: { number: true },
			})
			.catch(() => {
				redirect(`/medibook`);
			});
		redirect(`/medibook/sessions/${currentSession?.number || ""}`);
	}

	if (!session && props.unauthenticated) redirect(props.unauthenticated);
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
