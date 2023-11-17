"use client";

import React, { useEffect } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

export const ClientProvider = ({ children }) => {
	const queryClient = new QueryClient();

	useEffect(() => {
		return;
		console.log(
			`%c
		███    ███ ███████ ██████  ██ ███    ███ ██    ██ ███    ██
		████  ████ ██      ██   ██ ██ ████  ████ ██    ██ ████   ██
		██ ████ ██ █████   ██   ██ ██ ██ ████ ██ ██    ██ ██ ██  ██
		██  ██  ██ ██      ██   ██ ██ ██  ██  ██ ██    ██ ██  ██ ██
		██      ██ ███████ ██████  ██ ██      ██  ██████  ██   ████ `,
			"background: #AE2D29; color: #FFFFFF"
		);
	}, []);

	return (
		<SessionProvider>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</SessionProvider>
	);
};
