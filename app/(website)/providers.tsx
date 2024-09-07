"use client";

import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/system";

export function NextAuthProvider({ children }) {
	return (
		<NextUIProvider>
			<SessionProvider>{children}</SessionProvider>
		</NextUIProvider>
	);
}
