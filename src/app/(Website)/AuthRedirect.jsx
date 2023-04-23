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
