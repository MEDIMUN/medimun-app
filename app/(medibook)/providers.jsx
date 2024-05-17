"use client";

import React, { useEffect, createContext, useState, useContext } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

export const SidebarContext = createContext();

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

	const [isHidden, setIsHidden] = useState(false);

	return (
		<SidebarContext.Provider value={{ isHidden, setIsHidden }}>
			<SessionProvider basePath="">
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			</SessionProvider>
		</SidebarContext.Provider>
	);
};
