"use client";

import React, { Fragment } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const GeistProvider = ({ children }) => {
	const queryClient = new QueryClient();

	return (
		<Fragment>
			<QueryClientProvider client={queryClient}>
				{children}
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</Fragment>
	);
};
