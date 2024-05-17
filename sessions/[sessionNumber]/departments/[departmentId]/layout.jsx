"use client";

import { usePathname } from "next/navigation";
import SubMenu from "@/components/medibook/SubMenu";

export default function Layout(props) {
	const pathname = usePathname();
	const sessionNumber = pathname.split("/")[3];
	const departmentName = pathname.split("/")[5];

	const menuItems = [
		{
			title: "About",
			href: `/medibook/sessions/${sessionNumber}/departments/${departmentName}`,
		},
		{
			title: "Announcements",
			href: `/medibook/sessions/${sessionNumber}/departments/${departmentName}/announcements`,
		},
		{
			title: "Members & Managers",
			href: `/medibook/sessions/${sessionNumber}/departments/${departmentName}/members-managers`,
		},
		{
			title: "Tasks",
			href: `/medibook/sessions/${sessionNumber}/departments/${departmentName}/tasks`,
		},
		{
			title: "Documents",
			href: `/medibook/sessions/${sessionNumber}/departments/${departmentName}/documents`,
		},
	];

	return (
		<>
			<SubMenu menuItems={menuItems} />
			{props.children}
		</>
	);
}
