"use client";

import { usePathname } from "next/navigation";
import SubMenu from "@/components/medibook/SubMenu";

export default function Layout(props) {
	const pathname = usePathname();

	const menuItems = [
		{
			title: "About",
			href: `/sessions/${props.params.sessionNumber}`,
		},
		{
			title: "Committees",
			href: `/sessions/${props.params.sessionNumber}/committees`,
		},
		{
			title: "Departments",
			href: `/sessions/${props.params.sessionNumber}/departments`,
		},
	];
	return (
		<div className="mt-20">
			<SubMenu menuItems={menuItems} hide={pathname.split("/").filter((item) => item !== "").length > 4} />
			{props.children}
		</div>
	);
}
