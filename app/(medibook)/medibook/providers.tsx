"use client";

import { NextUIProvider as NUIP } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import React, { createContext, useContext, useState } from "react";

const SidebarContext = createContext({});

export function SidebarContextProvider({ children }) {
	const [sessionsData, setSessionsData] = useState();
	const [selectedSession, setSelectedSession] = useState();
	const [selectedSessionData, setSelectedSessionData] = useState();
	const [isLoading, setIsLoading] = useState(false);
	const [schoolDirectorRole, setSchoolDirectorRole] = useState({});

	return (
		<SidebarContext.Provider
			value={{
				sessionsData,
				setSessionsData,
				selectedSession,
				setSelectedSession,
				selectedSessionData,
				setSelectedSessionData,
				isLoading,
				setIsLoading,
				schoolDirectorRole,
				setSchoolDirectorRole,
			}}>
			{children}
		</SidebarContext.Provider>
	);
}

export function Providers({ children }) {
	const router = useRouter();
	return (
		<SidebarContextProvider>
			<SessionProvider>
				<NUIP navigate={router.push}>
					<NextThemesProvider attribute="class" enableSystem defaultTheme="system">
						{children}
					</NextThemesProvider>
				</NUIP>
			</SessionProvider>
		</SidebarContextProvider>
	);
}

//	const [sessionsData, setSessionsData] = useState(sessions);
//	const [selectedSession, setSelectedSession] = useState(sessions[0]?.number);
//	const [selectedSessionData, setSelectedSessionData] = useState();
//	const [isLoading, setIsLoading] = useState(false);
//	const [schoolDirectorRole, setSchoolDirectorRole] = useState({});

export function useSidebarContext(): any {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebarContext must be used within a SidebarContextProvider");
	}
	return context;
}
