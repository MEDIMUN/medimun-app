import "@/styles/globals.css";

import { Avatar } from "@/components/avatar";
import { Dropdown, DropdownButton } from "@/components/dropdown";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import { SidebarLayout } from "@/components/sidebar-layout";
import Landscape from "@/components/website/Landscape";
import Image from "next/image";
import MediBookLogo from "@/public/assets/branding/logos/medibook-logo-white-2.svg";
import Link from "next/link";
import { auth } from "@/auth";
import { Sidebar } from "./sidebar";
import { AccountDropdownMenu } from "./sidebar";
import prisma from "@/prisma/client";
import { Providers } from "./providers";
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
	announcementModals,
}): Promise<JSX.Element> {
	const authSession = await auth();
	const sessions = await prisma.session
		.findMany({
			take: 5,
			orderBy: [{ isCurrent: "desc" }, { numberInteger: "desc" }],
		})
		.catch();

	return (
		<html lang="en" className={cn("text-zinc-950 antialiased !scrollbar-hide dark:bg-zinc-900 dark:text-white lg:bg-zinc-100")}>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="preconnect" href="https://rsms.me/" />
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
			</head>
			<body className="overflow-x-hidden">
				<Providers>
					{committeeModals}
					{locationModals}
					{schoolModals}
					{resourceModals}
					{userModals}
					<Landscape />
					<SidebarLayout
						navbar={
							<Navbar>
								<Link href="/medibook" className="ml-1">
									<Image src={MediBookLogo} alt="MediBook" width={110} height={100} />
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
						}
						sidebar={<Sidebar sessions={sessions} />}>
						{announcementModals}
						{children}
					</SidebarLayout>
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
