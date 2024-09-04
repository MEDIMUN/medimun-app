import "@/styles/globals.css";

import { Avatar } from "@/components/avatar";
import { Dropdown, DropdownButton } from "@/components/dropdown";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import { SidebarLayout } from "@/components/sidebar-layout";
import Landscape from "@/components/website/Landscape";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { Sidebar } from "./sidebar";
import { AccountDropdownMenu } from "./sidebar";
import prisma from "@/prisma/client";
import { Providers, SidebarContextProvider } from "./providers";
import { Toaster } from "sonner";

import type { Metadata } from "next";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
	title: {
		template: "%s - MediBook",
		default: "MediBook",
	},
	description: "",
};

export default async function RootLayout({
	children,
	userModals,
	resourceModals,
	schoolModals,
	locationModals,
	committeeModals,
	announcement,
	sessionModals,
	departmentModals,
	departmentModalDelete,
	departmentModalCreate,
	departmentModalEdit,
}): Promise<JSX.Element> {
	const authSession = await auth();
	const sessions = await prisma.session
		.findMany({
			take: 5,
			orderBy: [{ isCurrent: "desc" }, { numberInteger: "desc" }],
		})
		.catch();

	return (
		<html
			lang="en"
			className={cn("text-zinc-950 antialiased !scrollbar-hide dark:bg-zinc-900 dark:text-white lg:bg-zinc-100")}
			suppressHydrationWarning>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="preconnect" href="https://rsms.me/" />
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
			</head>
			<body className="overflow-x-hidden">
				<noscript className="fixed z-[1000] flex min-h-[100vh] w-full flex-col bg-primary text-white">
					<div className="mx-auto my-auto w-full max-w-lg p-4 text-center">
						<Link href="/home">
							<img src={`/assets/branding/logos/logo-medired.svg`} className="mx-auto mb-10 h-[60px] font-[montserrat]" alt="MediBook" />
						</Link>
						<p>
							Your browser does not support JavaScript or it&apos;s turned off. The MediBook App and the MEDIMUN Website require JavaScript to
							function properly. Please enable JavaScript in your browser settings.
						</p>
						<br />
						<p>If you believe this is an error, please contact us.</p>
						<br />
						<p className="text-xs">
							If you need to access MediBook without JavaScript, please email us using the email address you registered with for the conference. We
							will consider remotely enabling a limited version of the app for you.
						</p>
					</div>
				</noscript>
				<Providers>
					{departmentModals}
					{committeeModals}
					{locationModals}
					{schoolModals}
					{resourceModals}
					{userModals}
					{sessionModals}
					{departmentModalDelete}
					{departmentModalCreate}
					{departmentModalEdit}
					<Landscape />
					<SidebarLayout
						navbar={
							<SidebarContextProvider>
								<Navbar>
									<Link href="/medibook" className="ml-1">
										<img src={`/assets/branding/logos/medibook-logo-white-2.svg`} className="h-[18px]" alt="MediBook" />
									</Link>
									<NavbarSpacer />
									<div className="rounded-full border bg-content1/80 px-6 py-1 text-sm font-light shadow-sm">Upcoming</div>
									<NavbarSection>
										<Dropdown>
											<DropdownButton as={NavbarItem}>
												<Avatar src={`/api/users/${authSession?.user?.id}/avatar`} square />
											</DropdownButton>
											<AccountDropdownMenu anchor="bottom end" />
										</Dropdown>
									</NavbarSection>
								</Navbar>
							</SidebarContextProvider>
						}
						sidebar={
							<SidebarContextProvider>
								<Sidebar sessions={sessions} />
							</SidebarContextProvider>
						}>
						{/*-*/}
						{announcement}
						{children}
					</SidebarLayout>
					<Toaster richColors visibleToasts={5} closeButton />
				</Providers>
			</body>
		</html>
	);
}
