import { ActionList } from "@/app/components/actions-list";
import { auth } from "@/auth";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { cn } from "@/lib/cn";
import MediBookWelcome from "@/public/assets/medibook-welcome.webp";
import Image from "next/image";

export default async function Home() {
	const authSession = await auth();
	const officialName = authSession?.user?.officialName;
	const displayName = authSession?.user?.displayName;
	const preferredName = displayName?.split(" ")[0] || officialName;
	const userId = authSession?.user?.id;
	const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

	const actions = [
		{
			title: "All Sessions",
			description: "View all sessions",
			href: `/medibook/sessions`,
		},
		{
			title: "School Director Applications",
			description: "Applications for the position of School Director",
			href: `/medibook/sessions/20/apply/school-director`,
		},
		{
			title: "Global Announcements",
			description: "View all global announcements",
			href: `/medibook/announcements`,
		},
		{
			title: "Session Announcements",
			description: "View all the announcements from the latest session",
			href: `/medibook/sessions/20/announcements`,
		},
		{
			title: "Global Resources",
			description: "View all global resources",
			href: `/medibook/resources`,
		},
		{
			title: "Session Resources",
			description: "View all the resources from the latest session",
			href: `/medibook/sessions/20/resources`,
		},
		{
			title: "Policies",
			description: "View conference rules and policies.",
			href: `/medibook/policies`,
		},
		{
			title: "Account Settings",
			description: "Change your account settings and add personal information",
			href: `/medibook/account`,
		},
	];

	if (!userId) return null;

	return (
		<>
			<div>
				<Heading>
					{greeting}, {preferredName}
				</Heading>
				<Text>
					Your User ID is {userId.slice(0, 4)}-{userId.slice(4, 8)}-{userId.slice(8, 12)}
				</Text>
			</div>
			<div className="w-full overflow-hidden rounded-xl shadow-md">
				<Image alt="Welcome to MediBook." quality={100} className="!relative object-cover" src={MediBookWelcome} fill />
			</div>
			<ActionList actions={actions} />
		</>
	);
}
