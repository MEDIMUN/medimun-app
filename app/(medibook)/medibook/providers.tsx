"use client";

import { NextUIProvider as NUIP } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import React, { createContext, useCallback, useContext, useState } from "react";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/alert";
import { Button } from "@/components/button";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
	const [isOpen, setIsOpen] = useState(false);
	const [confirmMessage, setConfirmMessage] = useState("");
	const [confirmDescription, setConfirmDescription] = useState("");
	const [resolvePromise, setResolvePromise] = useState(null);

	const confirm = useCallback((message) => {
		setConfirmMessage(message.message);
		setConfirmDescription(message.description);
		setIsOpen(true);

		return new Promise((resolve) => {
			setResolvePromise(() => resolve);
		});
	}, []);

	const handleCancel = () => {
		setIsOpen(false);
		if (resolvePromise) {
			resolvePromise(false);
		}
	};

	const handleConfirm = () => {
		setIsOpen(false);
		if (resolvePromise) {
			resolvePromise(true);
		}
	};

	return (
		<ConfirmContext.Provider value={confirm}>
			<Alert open={isOpen} onClose={setIsOpen}>
				<AlertTitle>{confirmMessage}</AlertTitle>
				<AlertDescription>{confirmDescription}</AlertDescription>
				<AlertActions>
					<Button plain onClick={handleCancel}>
						Cancel
					</Button>
					<Button onClick={handleConfirm}>Confirm</Button>
				</AlertActions>
			</Alert>
			{children}
		</ConfirmContext.Provider>
	);
}

export function useConfirm() {
	const context = useContext(ConfirmContext);
	if (!context) {
		throw new Error("useConfirm must be used within a ConfirmProvider");
	}
	return context;
}

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
		<ConfirmProvider>
			<SidebarContextProvider>
				<SessionProvider>
					<NUIP className="h-full" navigate={router.push}>
						<NextThemesProvider attribute="class" enableSystem defaultTheme="light">
							{children}
						</NextThemesProvider>
					</NUIP>
				</SessionProvider>
			</SidebarContextProvider>
		</ConfirmProvider>
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
