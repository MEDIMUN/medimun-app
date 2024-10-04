import { auth } from "@/auth";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Divider } from "@/components/divider";
import { Heading, Subheading } from "@/components/heading";
import { Select } from "@/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Text } from "@/components/text";
import { cn } from "@/lib/cn";
import MediBookWelcome from "@/public/assets/medibook-welcome.webp";
import Image from "next/image";
import Link from "next/link";

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
					Your ID number is {userId.slice(0, 4)}-{userId.slice(4, 8)}-{userId.slice(8, 12)}
				</Text>
			</div>
			<div className="w-full overflow-hidden rounded-xl shadow-md">
				<Image alt="Welcome to MediBook." quality={100} className="!relative object-cover" src={MediBookWelcome} fill />
			</div>
			<div className="divide-y divide-gray-200 overflow-hidden rounded-xl bg-gray-200 shadow-md ring-1 ring-gray-200 sm:grid sm:grid-cols-1 sm:gap-px sm:divide-y-0">
				{actions.map((action, actionIdx) => (
					<div
						key={action.title}
						className={cn(
							actionIdx === 0 ? "rounded-tl-xl rounded-tr-xl sm:rounded-tr-none" : "",
							actionIdx === actions.length - 1 ? "rounded-bl-xl rounded-br-xl sm:rounded-bl-none" : "",
							"group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
						)}>
						<div>
							<h3 className="text-base font-semibold leading-6 text-gray-900">
								<Link href={action.href} className="focus:outline-none">
									{/* Extend touch target to entire panel */}
									<span aria-hidden="true" className="absolute inset-0" />
									{action.title}
								</Link>
							</h3>
							<p className="mt-2 text-sm text-gray-500">{action.description}</p>
						</div>
						<span aria-hidden="true" className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400">
							<svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6">
								<path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
							</svg>
						</span>
					</div>
				))}
			</div>
		</>
	);
}
