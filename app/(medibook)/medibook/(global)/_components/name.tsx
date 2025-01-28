"use client";

import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { useSession } from "next-auth/react";

export function NameDisplay() {
	const { data: authSession, status } = useSession();
	const officialName = authSession?.user?.officialName;
	const displayName = authSession?.user?.displayName;
	const preferredName = displayName?.split(" ")[0] || officialName;
	const userId = authSession?.user?.id;
	const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

	if (status === "authenticated" && userId)
		return (
			<>
				<Heading>
					{greeting}, {preferredName}
				</Heading>
				<Text>
					Your User ID is {userId.slice(0, 4)}-{userId.slice(4, 8)}-{userId.slice(8, 12)}
				</Text>
			</>
		);

	return (
		<>
			<Heading>
				<span className="animate-pulse bg-gray-200 dark:bg-gray-800 h-8 w-64 rounded-md"></span>
			</Heading>
			<Text>
				<span className="flex mt-1 w-64 h-5 animate-pulse delay-500 bg-gray-100 dark:bg-gray-800 rounded-md"></span>
			</Text>
		</>
	);
}
