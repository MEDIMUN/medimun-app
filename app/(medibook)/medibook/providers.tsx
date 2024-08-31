"use client";

import { NextUIProvider as NUIP } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import React from "react";

export function Providers({ children }) {
	const router = useRouter();
	return (
		<SessionProvider>
			<NUIP navigate={router.push}>
				<NextThemesProvider attribute="class" enableSystem defaultTheme="system">
					{children}
				</NextThemesProvider>
			</NUIP>
		</SessionProvider>
	);
}
