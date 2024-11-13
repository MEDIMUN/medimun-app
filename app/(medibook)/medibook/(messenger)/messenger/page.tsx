"use client";

import { Divider } from "@/components/divider";
import { Text } from "@/components/text";
import { arrayFromNumber } from "@/lib/array-from-number";
import { User } from "@nextui-org/user";
import { SearchBar, SearchParamsButton } from "../../client-components";
import { Button } from "@/components/button";
import Paginator from "@/components/pagination";
import { Heading } from "@/components/heading";
import { Badge } from "@/components/badge";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { useEffect, useRef, useState } from "react";

export default function Messaging() {
	const [number, setNumber] = useState(0);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	//check if the element is in view

	const inViewRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setNumber((prev) => prev + 0);
					}
				});
			},
			{ threshold: 0.5 }
		);
		if (inViewRef.current) {
			observer.observe(inViewRef.current);
		}
		return () => {
			if (inViewRef.current) {
				observer.unobserve(inViewRef.current);
			}
		};
	}, [inViewRef.current]);

	return (
		<div className="w-full flex h-full shadow-md">
			<div className="h-full flex flex-col gap-2 p-4">
				<div className="flex items-stretch">
					<Heading level={2}>Chats</Heading>
				</div>
				<div className="flex w-full gap-2 flex-1">
					<SearchBar className="min-w-60" />
					<SearchParamsButton searchParams={{ "create-new-group": true }} color="white" className="h-9">
						+
					</SearchParamsButton>
				</div>
				<ScrollShadow hideScrollBar orientation="vertical" className="!overflow-y-scroll !p-0 !m-0 mt-1 showscrollbar">
					<ul className="flex  flex-col gap-2">
						{arrayFromNumber(number).map((_, i) => (
							<li key={i} className="w-full flex p-2  hover:bg-zinc-100 hover:shadow-sm cursor-pointer duration-75 rounded-lg">
								<User
									avatarProps={{
										showFallback: true,
										src: "https://www.medimun.org/api/users/111111111111/avatar",
										className: "",
									}}
									name="John Doe"
									description={"Deputy Secretary-General"}
								/>
							</li>
						))}
					</ul>
					<div ref={inViewRef}></div>
				</ScrollShadow>
			</div>
			<div className="h-full w-[2px] bg-zinc-100"></div>
		</div>
	);
}
