"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { getOrdinal } from "@/lib/get-ordinal";
import { AnimatePresence, motion } from "framer-motion";
import { s } from "@/lib/authorize";
import Image from "next/image";
import { flushSync as flush } from "react-dom";
import { useSession } from "next-auth/react";

export function Navbar({ title = "", avatarProps = {}, selectedSession, queryParamWord = "search", isSearchBarVisible = true, actionsButtonText = "Actions", actionButtonText = "Add", actionButtonVisible = true, actionButtonProps = {}, searchPlaceholder = "Search" }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();

	const [query, setQuery] = useState(searchParams.get(queryParamWord) || "");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [debounced] = useDebouncedValue(query, 500);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		if (query) {
			updateSearchParams({ [queryParamWord]: debounced, page: 1 }, router);
		} else {
			removeSearchParams({ [queryParamWord]: "" }, router);
		}
	}, [debounced]);

	const navbarLinks = [
		{ title: "Overview", href: `/medibook/sessions/${selectedSession.number}`, visible: true },
		{ title: "Committees", href: `/medibook/sessions/${selectedSession.number}/committees`, visible: true },
		{ title: "Departments", href: `/medibook/sessions/${selectedSession.number}/departments`, visible: true },
		{ title: "Programme", href: `/medibook/sessions/${selectedSession.number}/programme`, visible: true },
		{ title: "Participants", href: `/medibook/sessions/${selectedSession.number}/participants`, visible: true },
		{ title: "Resources", href: `/medibook/sessions/${selectedSession.number}/resources`, visible: true },
		{ title: "Settings", href: `/medibook/sessions/${selectedSession.number}/settings`, visible: true },
	];

	const visibleNavbarLinks = navbarLinks.filter((link) => link.visible);

	function handleSearchbarToggle() {
		if (isSearchOpen) {
			flush(() => setQuery(""));
			removeSearchParams({ [queryParamWord]: "" }, router);
			console.log(query);
			setIsSearchOpen(false);
		} else {
			setIsSearchOpen(true);
		}
	}

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return;

	return (
		<nav className="mt-4 flex w-full flex-col items-center font-[]">
			<div className="w-full px-4 lg:px-5">
				<header className="mb-4 flex w-full items-center justify-between">
					<motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} className="flex">
						<div className="mr-3 flex aspect-square h-12 w-12 rounded-xl bg-primary/90 text-center text-white shadow-sm">
							<p className="mx-auto my-auto text-xl font-thin">II</p>
						</div>
						<div>
							<h1 className="flex text-[18px] font-semibold text-default-900">
								{selectedSession.number}
								<sup className="font-regular translate-y-2 text-xs">{getOrdinal(selectedSession.number)}</sup> Annual Session
							</h1>
							<p className="-mt-[2px] text-sm text-default-400">{selectedSession.theme}</p>
						</div>
					</motion.div>
					<Avatar src={`/api/users/${session?.user?.id}/avatar`} showFallback className="mr-1" isBordered size="sm" color="primary" {...avatarProps} />
				</header>
				<div className="flex h-12 overflow-hidden rounded-xl bg-content1/60 align-middle shadow-sm md:relative">
					<Button isIconOnly className="m-0 ml-auto h-auto rounded-none border-r border-divider px-4" color="" onPress={() => setIsSearchOpen(!isSearchOpen)} startContent={<Icon className="flex-none text-current" icon="solar:alt-arrow-left-outline" width={24} />}></Button>
					<div className="relative w-full">
						<AnimatePresence mode="wait">
							{isSearchOpen && (
								<motion.div exit={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} initial={{ x: -100, opacity: 0 }} className="absolute w-full">
									<Input onClear={() => setQuery("")} onChange={(e) => setQuery(e.target.value)} startContent={<Icon className="flex-none text-current" icon="lucide:search" width={20} />} isClearable size="lg" classNames={{ inputWrapper: "bg-transparent rounded-none" }} placeholder={searchPlaceholder} />
								</motion.div>
							)}
						</AnimatePresence>
						<AnimatePresence initial={false} mode="wait">
							{!isSearchOpen && (
								<motion.div style={{ position: "absolute" }} exit={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} initial={{ x: -100, opacity: 0 }} className="absolute w-full">
									{/* <Button size="lg" className="w-full md:hidden" color="" startContent={<Icon className="flex-none text-current" icon="solar:hamburger-menu-linear" width={20} />} radius="none">
										{actionsButtonText}
									</Button> */}
									<ScrollShadow aclassName="hidden md:block" hideScrollBar orientation="horizontal">
										<Tabs items={navbarLinks} selectedKey={pathname} aria-label="Navigation Tabs" classNames={{ base: "w-full ml-2", tabList: "gap-5 px-4 py-0 w-full relative rounded-none", cursor: "w-full", tab: "max-w-fit px-0 h-12" }} variant="underlined">
											{(link) => <Tab as={Link} href={link.href} key={link.href} title={link.title} className="" />}
										</Tabs>
									</ScrollShadow>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
					<Button isIconOnly className="m-0 ml-auto h-auto rounded-none border-l border-divider px-4" color="" onPress={handleSearchbarToggle} startContent={<Icon className="flex-none text-current" icon={!isSearchOpen ? "lucide:search" : "maki:cross"} width={16} />}></Button>
					{actionButtonVisible && (
						<Button {...actionButtonProps} className="m-0 h-auto min-w-max rounded-l-none border-l border-divider" color="" onPress={() => updateSearchParams({ add: "" }, router)} startContent={<Icon className="flex-none text-current" icon="lucide:plus" width={16} />}>
							{actionButtonText}
						</Button>
					)}
				</div>
			</div>
		</nav>
	);
}
