import "@/styles/globals.css";
import Landscape from "@/components/website/Landscape";
import Navbar from "@/nextuipro/navigation-header-with-heading-cta";
import { ClientProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { NextUIProvider } from "./next-ui-provider";
import Sidebar from "@/components/medibook/Sidebar";
import { Divider } from "@nextui-org/divider";
import { NavbarWithToggle } from "@/components/medibook/TopBar";
import prisma from "@/prisma/client";

export const metadata = {
	title: "MediBook",
	description: "MediBook is the new platform for everything MEDIMUN.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({ children }) {
	const currentPage = 1;
	const sessions = await prisma.session
		.findMany({
			skip: (currentPage - 1) * 10,
			take: 10,
			orderBy: {
				number: "desc",
			},
		})
		.catch();

	return (
		<html lang="en" className="font-[montserrat]">
			<ClientProvider>
				<body>
					<NextUIProvider>
						<Landscape />
						<div className="-bg-dot-black/25 -dark:bg-dot-white/25 flex w-full flex-row  bg-content2">
							<Sidebar sessions={sessions} />
							<div className="h-[100svh] w-full overflow-y-scroll">
								{/* 								<NavbarWithToggle />
								 */}{" "}
								<main className="">{children}</main>
							</div>
						</div>
						<Toaster />
					</NextUIProvider>
				</body>
			</ClientProvider>
		</html>
	);
}
