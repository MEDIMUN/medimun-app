import SubMenu from "@/components/medibook/SubMenu";

export const menuItems = [
	{
		title: "Home",
		href: "/medibook",
	},
	{
		title: "Sessions",
		href: `/medibook/sessions`,
	},
	{
		title: "Announcements",
		href: `/medibook/announcements`,
	},
	{
		title: "Users",
		href: `/medibook/users`,
	},
];

export default function Layout({ children }) {
	return (
		<>
			<SubMenu menuItems={menuItems} />
			{children}
		</>
	);
}
