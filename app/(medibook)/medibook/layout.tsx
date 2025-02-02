import "@/styles/globals.css";

import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { JSX, Suspense } from "react";
import { SocketHandler } from "./client-components";
import ThemedHTMLElement from "./html-element";

export const metadata: Metadata = {
	title: {
		template: "%s - MediBook",
		default: "MediBook",
	},
	description: "MediBook is the official platform for the MEDIMUN conference.",
};

export function NoScript() {
	return (
		<noscript className="fixed z-[1000] flex min-h-[100vh] w-full flex-col bg-primary text-white">
			<div className="mx-auto my-auto w-full max-w-lg p-4 text-center">
				<Link href="/home">
					<img src={`/assets/branding/logos/logo-medired.svg`} className="mx-auto mb-10 h-[60px] font-[Gilroy]" alt="MediBook" />
				</Link>
				<p>
					Your browser does not support JavaScript or it&apos;s turned off. The MediBook App and the MEDIMUN Website require JavaScript to function
					properly. Please enable JavaScript in your browser settings.
				</p>
				<br />
				<p>If you believe this is an error, please contact us.</p>
				<br />
				<p className="text-xs">
					If you need to access MediBook without JavaScript, please email us using the email address you registered with for the conference. We will
					consider remotely enabling a limited version of the app for you.
				</p>
			</div>
		</noscript>
	);
}

async function SessionsSidebar() {
	const sessionsPromise = await prisma.session
		.findMany({
			take: 5,
			orderBy: [{ isMainShown: "desc" }, { numberInteger: "desc" }],
		})
		.catch();

	const authSessionPromise = await auth();

	const [sessions, authSession] = await Promise.all([sessionsPromise, authSessionPromise]);

	return <AppSidebar authSession={authSession} sessions={sessions} />;
}

export default function RootLayout({
	children,
	userModals,
	resourceModals,
	schoolModals,
	committeeModals,
	announcement,
	sessionModals,
	departmentModals,
	departmentModalDelete,
	departmentModalCreate,
	departmentModalEdit,
	rollCallModals,
	topicsModals,
	privateMessageModals,
	invoiceModals,
}): JSX.Element {
	return (
		<ThemedHTMLElement>
			<head>
				<link rel="manifest" href="/manifest.json" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content" />
				<link rel="preconnect" href="https://rsms.me/" />
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
				<script defer src="https://cloud.umami.is/script.js" data-website-id="5a019229-4342-4469-95e7-15fce101a3da"></script>
			</head>
			<body className="h-full w-full !font-sans flex flex-col">
				<NoScript />
				<Providers>
					<Suspense fallback={null}>
						<SocketHandler />
					</Suspense>
					<Suspense fallback={null}>
						{departmentModals}
						{committeeModals}
						{schoolModals}
						{resourceModals}
						{userModals}
						{sessionModals}
						{departmentModalDelete}
						{departmentModalCreate}
						{departmentModalEdit}
						{rollCallModals}
						{topicsModals}
						{privateMessageModals}
						{invoiceModals}
					</Suspense>
					<SidebarProvider>
						<Suspense fallback={null}>
							<SessionsSidebar />
						</Suspense>
						<div className="max-h-dvh relative w-full overflow-y-scroll overflow-x-hidden">
							<main id="main-element" className="overflow-x-hidden w-full overflow-y-scroll">
								<Suspense fallback={null}>
									<div className="h-[65px] shadow-sm"></div>
									{children}
									{announcement}
								</Suspense>
							</main>
						</div>
					</SidebarProvider>
					<Toaster richColors visibleToasts={4} closeButton />
				</Providers>
			</body>
		</ThemedHTMLElement>
	);
}
