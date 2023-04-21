"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
/* import { Toaster } from "@/components/ui/toaster"
 */
type Props = {
	children?: React.ReactNode;
};

export const NextAuthProvider = ({ children }: Props) => {
	const queryClient = new QueryClient();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<SessionProvider>
				{children}
				{/* 				<Toaster />
				 */}
				<ReactQueryDevtools />
			</SessionProvider>
		</QueryClientProvider>
	);
};
