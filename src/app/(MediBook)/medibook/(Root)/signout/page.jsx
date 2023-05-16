"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function Page() {
	useEffect(() => {
		signOut({
			callbackUrl:
				"/login?noticetitle=You have been signed out&noticedescription=You may contact us for more information.",
		});
	}, []);
	return <></>;
}
