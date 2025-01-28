"use client";

import { SessionProvider } from "next-auth/react";
import { HeroUIProvider } from "@heroui/system";

export function NextAuthProvider({ children }) {
	return (
		<HeroUIProvider>
			<SessionProvider>{children}</SessionProvider>
		</HeroUIProvider>
	);
}
