import { cn } from "@/lib/utils";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import BlackLogo from "@/public/assets/branding/logos/logo-black.svg";
import Image from "next/image";

export default function Loading() {
	return (
		<html lang="en" className={cn("antialiased h-full", GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
			<head>
				<link rel="manifest" href="/manifest.json" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content" />
				<link rel="preconnect" href="https://rsms.me/" />
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
				<script defer src="https://cloud.umami.is/script.js" data-website-id="5a019229-4342-4469-95e7-15fce101a3da"></script>
			</head>
			<body className="h-full w-full !font-sans flex flex-col dark:bg-black dark:text-white lg:bg-primary text-white ">
				<div className="max-h-dvh relative w-full h-full overflow-y-scroll overflow-x-hidden">
					<main id="main-element" className="overflow-x-hidden h-full flex items-center justify-center align-middle w-full overflow-y-scroll">
						<div className="m-auto">
							<Image className="w-64" src={BlackLogo} alt="Loading..." />
						</div>
					</main>
				</div>
			</body>
		</html>
	);
}
