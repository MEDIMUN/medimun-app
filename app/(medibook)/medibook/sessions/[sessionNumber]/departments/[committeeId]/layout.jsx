"use client";

import { usePathname } from "next/navigation";
import SubMenu from "@components/medibook/SubMenu";

export default function Layout(props) {
	const pathname = usePathname();
	const sessionNumber = pathname.split("/")[3];
	const committeeName = pathname.split("/")[5];

	const menuItems = [
		{
			title: "About",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeName}`,
		},
		{
			title: "Announcements",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeName}/announcements`,
		},
		{
			title: "Delegates",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeName}/delegates`,
		},
		{
			title: "Topics",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeName}/topics`,
		},
		{
			title: "Resolutions",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeName}/resolutions`,
		},
		{
			title: "Documents",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeName}/documents`,
		},
	];

	return (
		<>
			<SubMenu menuItems={menuItems} />
			{props.children}
		</>
	);
}
