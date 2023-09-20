"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
	const pathname = usePathname();
	return (
		<nav className="min-w-[200px] overflow-x-auto md:h-screen">
			<ol className="flex gap-2 md:flex-col">
				{menuItems.map((item) => (
					<Link key={item.name} href={item.href}>
						<li
							className={`-font-[Montserrat] min-w-max cursor-pointer rounded-lg p-2 px-5 text-black duration-300 hover:bg-gray-200 hover:shadow-lg ${
								pathname == item.href && "bg-gradient-to-r from-gray-700 via-gray-900 to-black text-white shadow-lg"
							}`}>
							{item.name}
						</li>
					</Link>
				))}
			</ol>
		</nav>
	);
}

const menuItems = [
	{ name: "Account", href: "/medibook/account" },
	{ name: "Security", href: "/medibook/account/security" },
	{ name: "Email", href: "/medibook/" },
	{ name: "School", href: "/medibook/" },
	{ name: "Certificates", href: "/medibook/" },
	{ name: "Notifications", href: "/medibook/" },
	{ name: "Profile Picture", href: "/medibook/account/profile-picture" },
];
