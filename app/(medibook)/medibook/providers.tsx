"use client";

import { HeroUIProvider as NUIP } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import React, { createContext, useContext, useState } from "react";
import { SocketProvider } from "@/contexts/socket";

const SidebarContext = createContext({});

export function SidebarContextProvider({ children }) {
	const [sessionsData, setSessionsData] = useState();
	const [selectedSession, setSelectedSession] = useState();
	const [selectedSessionData, setSelectedSessionData] = useState();
	const [isLoading, setIsLoading] = useState(false);
	const [schoolDirectorRoles, setSchoolDirectorRoles] = useState([]);
	const [delegateRoles, setDelegateRoles] = useState({});
	const [chairRoles, setChairRoles] = useState({});

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
				schoolDirectorRoles,
				setSchoolDirectorRoles,
				delegateRoles,
				setDelegateRoles,
				chairRoles,
				setChairRoles,
			}}>
			{children}
		</SidebarContext.Provider>
	);
}

export function Providers({ children }) {
	const router = useRouter();
	return (
		<SocketProvider>
			<SidebarContextProvider>
				<SessionProvider>
					<NUIP className="h-full" navigate={router.push}>
						<NextThemesProvider attribute="class" enableSystem defaultTheme="light">
							{children}
						</NextThemesProvider>
					</NUIP>
				</SessionProvider>
			</SidebarContextProvider>
		</SocketProvider>
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
