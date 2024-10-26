"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { use, useRef, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { Input } from "@/components/input";
import { updateSearchParams, removeSearchParams } from "@/lib/searchParams";
import { useEffect } from "react";
import { Button } from "@/components/button";
import { Icon } from "@iconify/react";
import { Avatar } from "@nextui-org/avatar";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Tab, Tabs } from "@nextui-org/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { flushSync as flush } from "react-dom";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function Navbar({
	title = "" as any,
	hideBackButton = true,
	description = "",
	badge = "",
	navbarLinks = [],
	avatarProps = {},
	queryParamWord = "search",
	forceSearchBarVisible = false,
	forceActionButtonVisibleText = "Actions",
	actionButtonText = "Add",
	forceActionButtonVisible = true,
	actionButtonProps = {},
	searchPlaceholder = "Search",
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { data: session } = useSession();
	const navRef = useRef(null);

	const [query, setQuery] = useState(searchParams.get(queryParamWord) || "");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [debounced] = useDebouncedValue(query, 500);
	const [isMounted, setIsMounted] = useState(true);

	useEffect(() => {
		if (debounced) {
			updateSearchParams({ [queryParamWord]: debounced, page: 1 }, router);
		} else {
			removeSearchParams({ [queryParamWord]: "" }, router);
		}
		router.refresh();
	}, [debounced, queryParamWord, router]);

	const visibleNavbarLinks = navbarLinks.filter((link) => link.isVisible);

	function handleSearchbarToggle() {
		if (isSearchOpen) {
			flush(() => setQuery(""));
			removeSearchParams({ [queryParamWord]: "" }, router);
			setIsSearchOpen(false);
		} else {
			setIsSearchOpen(true);
		}
	}

	useEffect(() => {
		setIsMounted(false);
	}, []);

	const currentItem = visibleNavbarLinks.find((link) => link.href === pathname);

	if (isMounted) return;
	return (
		<nav ref={navRef} className="z-20 flex w-full flex-col items-center rounded-md border-b bg-content1 pt-3 shadow-md md:border-0 md:pt-0">
			<div className="w-full md:px-4">
				<header className="mb-1 w-full items-center justify-between md:mb-4">
					{(title || description || badge) && (
						<div className="ml-5 mt-2 flex w-full items-center justify-between md:ml-0 md:mt-4">
							<motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} className="flex h-12 pr-4">
								{badge && (
									<div className="mask mask-squircle mr-3 flex h-12 w-12 rounded-2xl bg-gradient-to-r from-primary/40 to-primary/90 shadow-sm">
										<div className="mask mask-squircle m-auto flex h-10 w-10 rounded-xl  border-content3-foreground bg-primary/90 text-center text-white shadow-xl">
											<p className="mx-auto my-auto select-none text-xl font-thin">{badge}</p>
										</div>
									</div>
								)}
								<div className={!description && "flex flex-col"}>
									<h1 className="my-auto flex text-[18px] font-semibold text-default-900">{title}</h1>
									{description && <p className="-mt-[2px] text-sm text-default-400">{description}</p>}
								</div>
							</motion.div>
							<Avatar
								src={`/api/users/${session?.user?.id}/avatar`}
								showFallback
								className="mr-1 hidden md:block"
								isBordered
								size="sm"
								color="primary"
								{...avatarProps}
							/>
						</div>
					)}
				</header>
				<div className="flex w-full gap-2">
					<div className="flex h-12 w-full overflow-hidden bg-content1/60 align-middle md:relative md:rounded-xl">
						{!hideBackButton && (
							<Button
								className="m-0 ml-auto h-auto rounded-none border-r border-divider px-4"
								onClick={() => setIsSearchOpen(!isSearchOpen)}></Button>
						)}
						<div className="relative w-full">
							<AnimatePresence mode="wait">
								{isSearchOpen && (
									<motion.div
										exit={{ x: 100, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										initial={{ x: -100, opacity: 0 }}
										className="absolute w-full">
										<Input
											autoFocus
											onClear={() => setQuery("")}
											onChange={(e) => setQuery(e.target.value)}
											value={query}
											startContent={<Icon className="flex-none text-current" icon="lucide:search" width={20} />}
											isClearable
											size="lg"
											classNames={{ inputWrapper: "bg-transparent rounded-none", input: "focus:border-none" }}
											placeholder={searchPlaceholder}
										/>
									</motion.div>
								)}
							</AnimatePresence>
							<AnimatePresence initial={false} mode="wait">
								{!isSearchOpen && (
									<motion.div
										style={{ position: "absolute" }}
										exit={{ x: 100, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										initial={{ x: -100, opacity: 0 }}
										className="absolute w-full">
										{/* <Button size="lg" className="w-full md:hidden" color="" startContent={<Icon className="flex-none text-current" icon="solar:hamburger-menu-linear" width={20} />} radius="none">
										{actionsButtonText}
									</Button> */}
										<ScrollShadow hideScrollBar orientation="horizontal">
											<Tabs
												items={visibleNavbarLinks}
												selectedKey={pathname}
												aria-label="Navigation Tabs"
												classNames={{
													base: "w-full ml-2",
													tabList: "gap-5 px-4 py-0 w-full relative rounded-none",
													cursor: "w-full",
													tab: "max-w-fit px-0 h-12",
												}}
												variant="underlined">
												{(link) => <Tab as={Link} href={link.href} key={link.href} title={link.title} className="" />}
											</Tabs>
										</ScrollShadow>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
						{(currentItem?.showSearchBar || forceSearchBarVisible) && (
							<Button
								isIconOnly
								className="m-0 ml-auto h-auto rounded-none border-l border-divider px-4"
								color=""
								onPress={handleSearchbarToggle}
								startContent={<Icon className="flex-none text-current" icon={!isSearchOpen ? "lucide:search" : "maki:cross"} width={16} />}></Button>
						)}
						{currentItem?.actionButton && currentItem.actionButton.isVisible && (
							<Button
								{...actionButtonProps}
								className="m-0 h-auto min-w-max rounded-l-none border-l border-divider"
								color=""
								isIconOnly={!currentItem.actionButton.title && !currentItem.actionButton.mobileTitle}
								onPress={() => updateSearchParams(currentItem.actionButton.searchParams, router)}
								startContent={currentItem.actionButton.icon && <Icon className={currentItem.actionButton.icon} icon="lucide:plus" width={16} />}>
								<span className="hidden md:inline">{currentItem.actionButton.title}</span>
								<span className="inline md:hidden">{currentItem.actionButton.mobileTitle}</span>
							</Button>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
