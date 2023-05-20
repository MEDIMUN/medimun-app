"use client";

import React, { Fragment } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { MDXProvider } from "@/src/providers/mdx";

export const GeistProvider = ({ children }) => {
	const queryClient = new QueryClient();

	return (
		<SessionProvider>
			<QueryClientProvider client={queryClient}>
				{children}
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</SessionProvider>
	);
};
