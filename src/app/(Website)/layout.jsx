import style from "./layout.module.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Landscape from "./Landscape";
import Beta from "./Beta";
import "@/src/app/globals.css";

import { NextAuthProvider } from "./providers";
import { CommandMenu } from "./CommandMenu";

export const metadata = {
	title: "Home | MEDIMUN",
	description: "The biggest THIMUN-affiliated MUN conference in the Mediterranean Region, established in 2005.",
	themeColor: "#000000",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<NextAuthProvider>
				<body className={style.body}>
					<Landscape />
					<Navbar />
					<Beta />
					<CommandMenu className={style.menu} />
					<main className={style.main}>{children}</main>
					<Footer />
				</body>
			</NextAuthProvider>
		</html>
	);
}
