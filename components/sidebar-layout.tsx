"use client";

import * as Headless from "@headlessui/react";
import React, { Suspense, useEffect, useState } from "react";
import { NavbarItem } from "./navbar";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";

function OpenMenuIcon() {
	return (
		<svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
			<path d="M2 6.75C2 6.33579 2.33579 6 2.75 6H17.25C17.6642 6 18 6.33579 18 6.75C18 7.16421 17.6642 7.5 17.25 7.5H2.75C2.33579 7.5 2 7.16421 2 6.75ZM2 13.25C2 12.8358 2.33579 12.5 2.75 12.5H17.25C17.6642 12.5 18 12.8358 18 13.25C18 13.6642 17.6642 14 17.25 14H2.75C2.33579 14 2 13.6642 2 13.25Z" />
		</svg>
	);
}

function CloseMenuIcon() {
	return (
		<svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
			<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
		</svg>
	);
}

function MobileSidebar({ open, close, children }: React.PropsWithChildren<{ open: boolean; close: () => void }>) {
	return (
		<Headless.Dialog open={open} onClose={close} className="lg:hidden overflow-x-hidden">
			<Headless.DialogBackdrop
				transition
				className="fixed inset-0 bg-black/30 transition data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
			/>
			<Headless.DialogPanel
				transition
				className="fixed inset-y-0 w-full transition !overflow-x-hidden duration-300 ease-in-out data-[closed]:-translate-x-full">
				<div className="flex h-full flex-col relative bg-white !overflow-x-hidden shadow-sm dark:bg-zinc-900 dark:ring-white/10">
					<div className="-mb-3 px-4 pt-3">
						<Headless.CloseButton as={NavbarItem} aria-label="Close navigation">
							<CloseMenuIcon />
						</Headless.CloseButton>
					</div>
					{children}
				</div>
			</Headless.DialogPanel>
		</Headless.Dialog>
	);
}

export function PathBasedNavbar({ setShowSidebar, navbar, scrollY }) {
	const pathname = usePathname();
	if (!pathname) return null;

	const hiddenPaths = ["/medibook/messenger/"];

	const pathIsHidden = hiddenPaths.some((path) => pathname.startsWith(path)) || pathname?.includes("chat");

	if (!pathIsHidden)
		return (
			<>
				<div className="min-h-[60px] lg:hidden"></div>
				<div className={cn("-bg-red-500 fixed z-[1000] h-[60px] w-full border-b bg-white lg:hidden", !!scrollY && "shadow-md")}>
					{/* Navbar on mobile */}
					<header className="-ring-1 mx-2 flex w-[calc(100%-16px)] items-center px-2 ring-zinc-950/5">
						<div className="py-2.5">
							<NavbarItem onClick={() => setShowSidebar(true)} aria-label="Open navigation">
								<OpenMenuIcon />
							</NavbarItem>
						</div>
						<div className="min-w-0 flex-1">{navbar}</div>
					</header>
				</div>
			</>
		);
}

export function SidebarLayout({ navbar, sidebar, children }: React.PropsWithChildren<{ navbar: React.ReactNode; sidebar: React.ReactNode }>) {
	let [showSidebar, setShowSidebar] = useState(false);
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		function handleScroll() {
			setScrollY(window.scrollY);
		}
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className="relative isolate flex h-full min-h-svh w-full font-[Gilroy] font-extrabold flex-col bg-white dark:bg-zinc-900 lg:bg-zinc-100 dark:lg:bg-zinc-950">
			{/* Sidebar on desktop */}
			<div className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</div>
			{/* Sidebar on mobile */}
			<MobileSidebar open={showSidebar} close={() => setShowSidebar(false)}>
				{sidebar}
			</MobileSidebar>
			<Suspense fallback={null}>
				<PathBasedNavbar setShowSidebar={setShowSidebar} navbar={navbar} scrollY={scrollY} />
			</Suspense>
			{/* Content */}
			<main className="flex h-full flex-1 flex-col lg:min-w-0 lg:pl-64 lg:pr-2 lg:pt-2">
				<Suspense fallback={null}>{children}</Suspense>
				<div className="min-h-2 h-2" />
			</main>
		</div>
	);
}
