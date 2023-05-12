import style from "./layout.module.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Landscape from "./components/Landscape";
import "@/src/app/globals.css";

import { NextAuthProvider } from "./providers";
import { CommandMenu } from "./components/CommandMenu";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<NextAuthProvider>
				<body className={style.body}>
					<Landscape />
					<Navbar />
					<CommandMenu className={style.menu} />
					<main className={style.main}>{children}</main>
					<Toaster />
					<Footer />
				</body>
			</NextAuthProvider>
		</html>
	);
}
