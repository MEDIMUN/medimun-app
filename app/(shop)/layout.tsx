import "@/styles/globals.css";
import "tailwindcss/tailwind.css";

export const metadata = {
	title: "Shop - MEDIMUN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="m-0 h-screen p-0">{children}</body>
		</html>
	);
}
