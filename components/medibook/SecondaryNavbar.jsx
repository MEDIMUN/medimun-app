"use client";

import { Link } from "next/link";
import { Button } from "@nextui-org/react";
/* import SearchBar from "@/app/(medibook)/medibook/sessions/[sessionNumber]/committees/SearchBar";
 */ import { Icon } from "@iconify/react";
import { updateSearchParams } from "@/lib/searchParams";
import { useRouter } from "next/navigation";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from "@nextui-org/react";
import { authorize, s as enums } from "@/lib/authorize";

export default function Component({ items, session }) {
	const router = useRouter();
	/*
	 */ if (session)
		return (
			<div className="w-full gap-3 bg-neutral-200 px-3 py-2 dark:bg-[#18181B] md:px-5">
				<div className="flex w-full flex-row">
					{authorize(session, [s.management]) && (
						<Dropdown>
							<DropdownTrigger>
								<Button variant="flat" isIconOnly className="ml-auto bg-neutral-100 text-3xl shadow-sm dark:bg-neutral-800">
									<Icon className="text-default-500" icon="solar:hamburger-menu-outline" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu emptyContent="No Actions.">
								{items.map((item, index) => {
									if (item.roles ? authorize(session, item.roles) : true)
										return (
											<DropdownItem
												key={index}
												onPress={() => {
													updateSearchParams(item.action, router);
												}}>
												{item.title}
											</DropdownItem>
										);
								})}
							</DropdownMenu>
						</Dropdown>
					)}
				</div>
			</div>
		);
}

export function s() {
	return enums;
}
