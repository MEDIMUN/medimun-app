"use client";

import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export default function ThemedHTMLElement({ children }) {
	const [theme, setTheme] = useState("");

	useEffect(() => {
		const getSystemTheme = () => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

		const updateTheme = () => {
			const savedTheme = localStorage.getItem("theme");
			if (savedTheme === "system") {
				setTheme(getSystemTheme());
			} else {
				setTheme(savedTheme || "light");
			}
		};

		const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const systemThemeListener = (e) => {
			if (localStorage.getItem("theme") === "system") {
				setTheme(e.matches ? "dark" : "light");
			}
		};

		darkModeQuery.addEventListener("change", systemThemeListener);

		const localStorageListener = () => {
			updateTheme();
		};
		window.addEventListener("storage", localStorageListener);

		updateTheme();

		return () => {
			darkModeQuery.removeEventListener("change", systemThemeListener);
			window.removeEventListener("storage", localStorageListener);
		};
	}, []);

	return (
		<html
			lang="en"
			className={cn(
				"antialiased h-full",
				theme === "dark" ? "bg-black text-white dark" : "lg:bg-zinc-100 text-zinc-950 light",
				GeistSans.variable,
				GeistMono.variable
			)}
			suppressHydrationWarning>
			{children}
		</html>
	);
}
