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
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cn } from "@/lib/cn";
import { authorize, s } from "@/lib/authorize";

export const metadata: Metadata = {
  title: {
    template: "%s - MediBook",
    default: "MediBook",
  },
  description: "MediBook is the official platform for the MEDIMUN conference.",
};

export function NoScript() {
  return (
    <noscript className="z-1000 bg-primary fixed flex min-h-screen w-full flex-col text-white">
      <div className="mx-auto my-auto w-full max-w-lg p-4 text-center">
        <Link href="/home">
          <img
            src={`/assets/branding/logos/logo-medired.svg`}
            className="mx-auto mb-10 h-[60px] font-[Gilroy]"
            alt="MediBook"
          />
        </Link>
        <p>
          Your browser does not support JavaScript or it&apos;s turned off. The MediBook App and the MEDIMUN Website
          require JavaScript to function properly. Please enable JavaScript in your browser settings.
        </p>
        <br />
        <p>If you believe this is an error, please contact us.</p>
        <br />
        <p className="text-xs">
          If you need to access MediBook without JavaScript, please email us using the email address you registered with
          for the conference. We will consider remotely enabling a limited version of the app for you.
        </p>
      </div>
    </noscript>
  );
}

async function SessionsSidebar() {
  const authSession = await auth();
  const isManagement = authorize(authSession, [s.management]);

  const sessions = await prisma.session
    .findMany({
      take: 5,
      ...(isManagement ? {} : { where: { isVisible: true } }),
      orderBy: [{ numberInteger: "desc" }],
    })
    .catch();

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
  individualCertificateModals,
}): JSX.Element {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", GeistSans.variable, GeistMono.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content" />
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="5a019229-4342-4469-95e7-15fce101a3da"
        ></script>
      </head>
      <body className="font-sans! lg:white flex h-full w-full flex-col text-zinc-950 dark:bg-black dark:text-white">
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
            {individualCertificateModals}
          </Suspense>
          <SidebarProvider>
            <Suspense fallback={null}>
              <SessionsSidebar />
            </Suspense>
            <div className="relative max-h-dvh w-full overflow-x-hidden overflow-y-scroll">
              <main id="main-element" className="w-full overflow-x-hidden overflow-y-scroll">
                <div className="h-[65px] shadow-sm"></div>
                {children}
                {announcement}
                {/*                 <div className="fixed bottom-16 left-1/2 right-1/2 z-[100] flex w-max -translate-x-1/2 gap-4">
                  <div className="duration-250 backdrop-blur-xs flex h-16 w-[400px] rounded-full border-2 border-gray-400/30 bg-neutral-600/20 bg-opacity-80 bg-clip-padding shadow-md backdrop-filter hover:border-gray-600/20 hover:bg-neutral-800/20 hover:shadow-xl hover:backdrop-blur-sm">
                    <div className="m-auto h-14 w-20 rounded-full bg-white/90 shadow-sm"></div>
                  </div>
                </div> */}
              </main>
            </div>
          </SidebarProvider>
          <Toaster richColors visibleToasts={4} closeButton />
        </Providers>
      </body>
    </html>
  );
}
