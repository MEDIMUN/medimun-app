import { ActionList } from "@/app/components/actions-list";
import MediBookWelcome from "@/public/assets/medibook-welcome.webp";
import Image from "next/image";
import { NameDisplay } from "./_components/name";
import prisma from "@/prisma/client";
import { countries } from "@/data/countries";
import { TopBar } from "../client-components";
import { Suspense } from "react";
import { MainWrapper } from "../server-components";

export default async function Home() {
	"use cache";

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

	return (
		<>
			<TopBar
				hideSearchBar
				hideBreadcrums
				title={
					<Suspense fallback="Loading...">
						<NameDisplay />
					</Suspense>
				}
			/>
			<MainWrapper>
				<div className="w-full overflow-hidden rounded-xl ring-zinc-300 ring-1">
					<Image alt="Welcome to MediBook." quality={100} className="!relative object-cover" src={MediBookWelcome} fill />
				</div>
				<ActionList actions={actions} />
			</MainWrapper>
		</>
	);
}
