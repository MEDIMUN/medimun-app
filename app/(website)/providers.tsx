"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";

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
				{/* 				<ReactQueryDevtools />
				 */}
			</SessionProvider>
		</QueryClientProvider>
	);
};
