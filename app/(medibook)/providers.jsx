"use client";

import React, { useEffect, createContext, useState, useContext } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { DarkModeContext } from "./dark-mode-provider";

export const SidebarContext = createContext();

export const ClientProvider = ({ children }) => {
	const queryClient = new QueryClient();
	let { setIsDark, isDark } = useContext(DarkModeContext);

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
		<SidebarContext.Provider value={{ isHidden, setIsHidden, isDark, setIsDark }}>
			<SessionProvider>
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			</SessionProvider>
		</SidebarContext.Provider>
	);
};
