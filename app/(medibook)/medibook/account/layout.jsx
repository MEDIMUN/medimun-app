import { TitleBar } from "@/components/medibook/TitleBar";
import SubMenu from "@/components/medibook/SubMenu";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const menuItems = [
	{
		title: "Personal Information",
		href: "/medibook/account",
	},
	{
		title: "Account Security",
		href: `/medibook/account/security`,
	},
	{
		title: "School Assignment",
		href: `/medibook/account/school`,
	},
	{
		title: "Update Email",
		href: `/medibook/account/email`,
	},
	{
		title: "Notification Settings",
		href: `/medibook/account/notifications`,
	},
];

export default async function Layout(props) {
	const session = await getServerSession(authOptions);
	return (
		<>
			<SubMenu menuItems={menuItems} />
			<TitleBar title="Account Settings" button1text="View Profile" button1href={`/medibook/users/${session.user.id}`} />
			<div className="mx-auto max-w-[1260px] p-2">{props.children}</div>
		</>
	);
}
