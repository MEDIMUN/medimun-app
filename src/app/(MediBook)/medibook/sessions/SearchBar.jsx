"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDebouncedState } from "@mantine/hooks";
import Link from "next/link";

export default function SearchBar(props) {
	const { data: session, status } = useSession();
	const roles = ["Global Admin", "Senior Director"];
	const [searchQuery, setSearchQuery] = useDebouncedState("", 300);

	const { data, refetch, isLoading } = useQuery({
		queryKey: ["SearchSessions"],
		queryFn: async () => {
			const { data } = await axios.get(`/api/sessions/search/${searchQuery}`);
			console.log(data);
			return data;
		},
		enabled: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});

	function romanize(num) {
		let lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 },
			roman = "",
			i;
		for (i in lookup) {
			while (num >= lookup[i]) {
				roman += i;
				num -= lookup[i];
			}
		}
		return roman;
	}

	useEffect(() => {
		if (!searchQuery) {
			return;
		}
		refetch();
	}, [searchQuery]);

	return (
		<>
			<div className="flex flex-row mx-auto max-w-[1200px]">
				<Input
					defaultValue={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.currentTarget.value);
					}}
					type="search"
					placeholder="Search for older sessions"
					className="text-md w-full rounded-[4px]"
				/>
				{status === "authenticated" && session.currentRoleNames.some((role) => roles.indexOf(role) >= 0) && <Button className="w-[120px] ml-2">Add New</Button>}
			</div>
			{searchQuery && !isLoading && (
				<ol className="flex flex-col mx-auto max-w-[1200px] border-[1px] bg-white z-50 border-[#E2E8F0] py-[5px] mt-2 cursor-pointer rounded-md shadow-md w-full overflow-hidden">
					{data.sessions.map((session) => {
						return (
							<li>
								<Link key={session.id} className="w-full flex h-[44px] my-1 hover:bg-gray-300 bg-white  p-1" href={`/medibook/sessions/${session.number}`}>
									<div className="flex flex-row align-middle">
										<h2 className={`${session.isCurrent ? "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" : "bg-black"} text-[24px] px-3 maxh-[40px] w-[40px] flex align-middle justify-center my-auto ml-2 mr-3 shadow-xl text-white rounded-xl`}>
											<span className="my-auto font-thin">{session.number}</span>
										</h2>
										<div className="leading-[18px]">
											<h4>
												<b>{session.theme || "Session " + session.number}</b>
											</h4>
											<h4>{session.phrase2 || "Session " + romanize(session.number)} </h4>
										</div>
									</div>
								</Link>
							</li>
						);
					})}
					{data.sessions.length == 0 && <li className="w-full p-2 flex h-10 bg-white align-middle py-auto">No results found</li>}
				</ol>
			)}
		</>
	);
}
