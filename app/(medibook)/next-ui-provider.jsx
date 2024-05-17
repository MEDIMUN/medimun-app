"use client";

import { NextUIProvider as NUIP } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function NextUIProvider({ children }) {
	const router = useRouter();
	return (
		<NUIP navigate={router.push}>
			<NextThemesProvider attribute="class" enableSystem defaultTheme="system">
				{children}
			</NextThemesProvider>
		</NUIP>
	);
}
