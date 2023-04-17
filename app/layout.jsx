import style from "./layout.module.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Landscape from "./Landscape";
import "@styles/globals.css";

import { NextAuthProvider } from "./providers";

export const metadata = {
	title: "Home | MEDIMUN",
	description: "The biggest THIMUN-affiliated MUN conference in the Mediterranean Region, established in 2005.",
};

export default function RootLayout({ children, session }) {
	return (
		<html lang="en">
			<NextAuthProvider>
				<body className={style.body}>
					<Landscape />
					<Navbar />
					<main className={style.main}>{children}</main>
					<Footer />
				</body>
			</NextAuthProvider>
		</html>
	);
}
