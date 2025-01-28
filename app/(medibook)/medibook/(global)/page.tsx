import { ActionList } from "@/app/components/actions-list";
import MediBookWelcome from "@/public/assets/medibook-welcome.webp";
import Image from "next/image";
import { NameDisplay } from "./_components/name";
import prisma from "@/prisma/client";
import { countries } from "@/data/countries";

export const experimental_ppr = true;

export default async function Home() {
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

	/* const delegates = await prisma.delegate.findMany({
		where: {
			committee: {
				session: {
					isMainShown: true,
				},
				shortName: "ICJ",
			},
		},
		select: {
			country: true,
		},
	});

	const extraCountries = await prisma.extraCountry.findMany({});

	const allCountries = countries.concat(extraCountries);

	const countriesD = delegates.map((delegate) => allCountries.find((country) => country.countryCode === delegate.country)?.countryNameEn).sort();

	console.log(countriesD); */

	return (
		<>
			<div className="w-full overflow-hidden">
				<Image alt="Welcome to MediBook." quality={100} className="!relative object-cover" src={MediBookWelcome} fill />
			</div>
			<div>
				<NameDisplay />
			</div>
			{/* <div className="flex flex-col">
				{countriesD.map(
					(country) =>
						country && (
							<div key={country} className="text-gray-500">
								{country}
							</div>
						)
				)}
			</div> */}
			<ActionList actions={actions} />
		</>
	);
}
