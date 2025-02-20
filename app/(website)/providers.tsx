"use client";

import { SessionProvider } from "next-auth/react";
import { HeroUIProvider } from "@heroui/system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function NextAuthProvider({ children }) {
	const queryClient = new QueryClient();
	return (
		<QueryClientProvider client={queryClient}>
			<HeroUIProvider>
				<SessionProvider>{children}</SessionProvider>
			</HeroUIProvider>
		</QueryClientProvider>
	);
}
