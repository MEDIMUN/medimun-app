"use client";

import { usePathname } from "next/navigation";
import SubMenu from "@/components/medibook/SubMenu";

export default function Layout(props) {
	const pathname = usePathname();

	const menuItems = [
		{
			title: "About",
			href: `/medibook/sessions/${props.params.sessionNumber}`,
		},
		{
			title: "Committees",
			href: `/medibook/sessions/${props.params.sessionNumber}/committees`,
		},
		{
			title: "Departments",
			href: `/medibook/sessions/${props.params.sessionNumber}/departments`,
		},
		{
			title: "Documents",
			href: `/medibook/sessions/${props.params.sessionNumber}/documents`,
		},
	];
	return (
		<>
			<SubMenu menuItems={menuItems} hide={pathname.split("/").filter((item) => item !== "").length > 4} />
			{props.children}
		</>
	);
}
