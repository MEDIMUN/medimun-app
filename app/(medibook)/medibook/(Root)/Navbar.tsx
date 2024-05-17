"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { updateSearchParams, removeSearchParams } from "@/lib/searchParams";
import { useEffect } from "react";
import { Spacer, Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { Avatar, AvatarGroup } from "@nextui-org/avatar";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Tab, Tabs } from "@nextui-org/tabs";
import { Divider } from "@nextui-org/divider";
import { Chip } from "@nextui-org/chip";
import { Tooltip } from "@nextui-org/tooltip";
import { romanize } from "@/lib/romanize";
import { committeeTypeMap } from "@/constants";

export function Navbar({ selectedCommittee }) {
	const router = useRouter();
	const pathname = usePathname();
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 500);
	const chair = selectedCommittee?.chair || [];

	useEffect(() => {
		if (debounced) {
			updateSearchParams({ query: debounced, page: 1 }, router);
		} else {
			removeSearchParams({ query: "" }, router);
		}
	}, [debounced]);

	const basePath = `/medibook/sessions/${selectedCommittee?.session?.number}/committees/${selectedCommittee.slug || selectedCommittee.id}`;

	const navbarLinks = [
		{
			title: "Overview",
			href: basePath + "",
			button: {
				hidden: false,
				text: "Edit",
				searchParams: { edit: selectedCommittee.id },
				icon: "solar:pen-outline",
			},
		},
		{
			title: "Committee Announcements",
			href: basePath + "/announcements",
			button: {
				hidden: false,
				text: "Create",
				searchParams: { create: "" },
				icon: "lucide:plus",
			},
		},
		{
			title: "Topics",
			href: basePath + "/topics",
			button: {
				hidden: false,
				text: "Edit",
				searchParams: { edit: "" },
				icon: "solar:pen-outline",
			},
		},
		{ title: "Resolutions", href: basePath + "/resolutions" },
		{ title: "Documents", href: basePath + "/documents" },
		{ title: "Roll Call", href: basePath + "/roll-call" },
	];

	const selectedLink = navbarLinks.find((link) => link.href === pathname);

	return (
		<nav className="mt-4 flex w-full flex-col items-center">
			<div className="w-full px-4 lg:px-6">
				<header className="mb-4 flex w-full items-center justify-between gap-2">
					<div className="flex">
						<Tooltip content={`Back to All Committees in Session ${selectedCommittee?.session?.number}`} placement="bottom">
							<Button as={Link} href={`/medibook/sessions/${selectedCommittee?.session?.number}/committees`} size="sm" isIconOnly className="my-auto mr-3 rounded-full">
								<Icon icon="solar:alt-arrow-left-outline" width={24} className="text-white" />
							</Button>
						</Tooltip>
						<div className="flex flex-col">
							<h1 className="text-xl font-bold text-default-900 lg:text-3xl">{selectedCommittee.name}</h1>
							<p className="text-small text-default-400 lg:text-medium">
								{!chair.length && committeeTypeMap[selectedCommittee.type]}
								{!!chair.length && "Chaired by "}
								{chair.map((chair: any, index: number) => {
									const user = chair?.user;
									const fullName = user?.displayName || user?.officialName + " " + user?.officialSurname || "";
									return (
										<span key={index}>
											{fullName}
											{selectedCommittee?.chair?.length - 1! > index + 1 && ", "}
											{selectedCommittee?.chair?.length - 1 == index + 1 && " & "}
										</span>
									);
								})}
							</p>
						</div>
					</div>
					{!selectedLink?.button?.hidden && selectedLink?.button && selectedLink?.button?.searchParams && (
						<Button color="primary" onPress={() => updateSearchParams(selectedLink?.button?.searchParams, router)} startContent={<Icon className="flex-none text-current" icon={selectedLink?.button?.icon} width={16} />}>
							{selectedLink?.button?.text}
						</Button>
					)}
				</header>
				<ScrollShadow hideScrollBar className="-mx-2 flex w-full justify-between gap-8" orientation="horizontal">
					<Tabs items={navbarLinks} selectedKey={pathname} aria-label="Navigation Tabs" radius="full" variant="light">
						{(link) => <Tab as={Link} href={link.href} key={link.href} title={link.title} />}
					</Tabs>
					<div className="flex items-center gap-4">
						<AvatarGroup max={3} size="sm" total={10}>
							<Tooltip content="John" placement="bottom">
								<Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
							</Tooltip>
							<Tooltip content="Mark" placement="bottom">
								<Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
							</Tooltip>
							<Tooltip content="Jane" placement="bottom">
								<Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
							</Tooltip>
						</AvatarGroup>
						<Divider className="h-6" orientation="vertical" />
						<Tooltip content="New deployment" placement="bottom">
							<Button isIconOnly radius="full" size="sm" variant="faded">
								<Icon className="text-default-500" icon="lucide:plus" width={16} />
							</Button>
						</Tooltip>
					</div>
				</ScrollShadow>
			</div>
		</nav>
	);
}

/* 			
classNames={{
				label: "text-black/50 dark:text-white/90",
				input: ["bg-transparent", "text-black/90 dark:text-white/90", "placeholder:text-default-700/50 text-[16px] dark:placeholder:text-white/60"],
				innerWrapper: "bg-transparent",
				inputWrapper: ["border-small border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10"],
			}}
*/
