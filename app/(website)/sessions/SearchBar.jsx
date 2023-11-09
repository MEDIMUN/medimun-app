"use client";

import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDebouncedState } from "@mantine/hooks";
import { romanize } from "@/lib/romanize";
import axios from "axios";
import Link from "next/link";

export default function SearchBar(props) {
	const [searchQuery, setSearchQuery] = useDebouncedState("", 300);

	const { data, refetch, isLoading } = useQuery({
		queryKey: ["SearchSessions"],
		queryFn: async () => {
			const { data } = await axios.get(`/api/sessions/search/${searchQuery}`);
			return data;
		},
		enabled: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});

	useEffect(() => {
		if (searchQuery) refetch();
	}, [searchQuery]);

	return (
		<>
			<div className="mx-auto flex max-w-[1200px] flex-row">
				<Input
					defaultValue={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.currentTarget.value);
					}}
					type="search"
					placeholder="Search for older sessions"
					className="text-md w-full rounded-[4px]"
				/>
			</div>
			{searchQuery && !isLoading && (
				<ol className="z-50 mx-auto mt-2 flex w-full max-w-[1200px] cursor-pointer flex-col overflow-hidden rounded-md border-[1px] border-[#E2E8F0] bg-white py-[5px] shadow-md">
					{data.sessions.map((session) => {
						return (
							<li>
								<Link key={session.id} className="my-1 flex h-[44px] w-full bg-white p-1  hover:bg-gray-300" href={`/medibook/sessions/${session.number}`}>
									<div className="flex flex-row align-middle">
										<h2
											className={`${
												session.isCurrent ? "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" : "bg-black"
											} maxh-[40px] my-auto ml-2 mr-3 flex w-[40px] justify-center rounded-xl px-3 align-middle text-[24px] text-white shadow-xl`}>
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
					{data.sessions.length == 0 && <li className="py-auto flex h-10 w-full bg-white p-2 align-middle">No results found</li>}
				</ol>
			)}
		</>
	);
}
