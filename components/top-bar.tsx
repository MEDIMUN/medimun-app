"use client";

import { useDebouncedValue } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "./ui/sidebar";
import { Input as SInput } from "@/components/ui/input";
import { FastLink } from "./fast-link";
import { ChevronLeft, Search, X } from "lucide-react";
import { Text } from "./text";
import MiniLogo from "@/public/assets/branding/logos/miniaturelogo.svg";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DirectionDropdown({ defaultValue, items, ...props }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	function handleOnChange(value: string) {
		const selectedItem = items.find((item) => item.value + item.order === value);
		if (selectedItem) {
			updateSearchParams({ order: selectedItem.value, direction: selectedItem.order }, router);
		}
	}

	const currentValue =
		items.find((item) => item.value + item.order === searchParams.get("order") + searchParams.get("direction")) ||
		items.find((item) => item.value + item.order === defaultValue);

	return (
		<Select onValueChange={handleOnChange} value={currentValue ? currentValue.value + currentValue.order : undefined} defaultValue={defaultValue}>
			<SelectTrigger {...props} className="w-full bg-white dark:bg-black">
				<SelectValue placeholder="Sort By" />
			</SelectTrigger>
			<SelectContent>
				{items.map((option, index) => (
					<SelectItem key={index} value={option.value + option.order}>
						<span className="font-medium">{option.label}</span>
						<span className="ml-2 text-muted-foreground">{option.description ? option.description : option.order.includes("asc") ? "↑" : "↓"}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export function TopBar({
	className = "",
	title = "" as any,
	sortOptions,
	defaultSort = "nameasc",
	children,
	searchText = "Search...",
	hideSearchBar = false,
	subheading = "",
	hideBreadcrums = false,
	buttonText = "",
	buttonHref = "",
	showDivider = false,
	hideBackdrop = false,
	config,
}: {
	className?: string;
	title?: string;
	sortOptions?: { value: string; order: string; label: string; description?: string }[];
	defaultSort?: string;
	children?: React.ReactNode;
	searchText?: string;
	hideSearchBar?: boolean;
	hideBreadcrums?: boolean;
	subheading?: string;
	buttonText?: string;
	buttonHref?: string;
	showDivider?: boolean;
	hideBackdrop?: boolean;
	config?: any;
}) {
	sortOptions = sortOptions && sortOptions.map((option, index) => ({ ...option, key: index }));

	const [isMounted, setIsMounted] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();
	const isSearchActive = !(searchParams?.get("search") == undefined);
	const [debouncedSearch] = useDebouncedValue(searchParams?.get("search") || "", 500);
	const searchInputRef = useRef(null);
	const spacerRef = useRef(null);
	const [configShown, setConfigShown] = useState(false);

	useLayoutEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		router.refresh();
	}, [debouncedSearch]);
	/* 	if (isMounted)
	 */ return (
		<>
			<Dialog open={configShown} onClose={() => setConfigShown(false)} title="Options" className="w-full max-w-[500px]">
				<DialogTitle>Options</DialogTitle>
				<DialogBody>{config}</DialogBody>
				<DialogActions>
					<Button onClick={() => setConfigShown(false)}>Close</Button>
				</DialogActions>
			</Dialog>
			<header className="flex z-[50] flex-col bg-sidebar-primary-foreground dark:bg-sidebar right-0 fixed top-0 w-full md:w-[calc(100%-288px)] border-b border-sidebar-border h-[65px] shrink-0 items-center -transition-[width,height] -ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
				<div className="flex items-center h-[65px] w-full">
					<div className="flex items-center w-full">
						<div className="w-full flex flex-col h-[65px] duration-200 border-b border-sidebar-border overflow-y-hidden">
							<div className={cn("min-h-[65px] fixed top-0 flex items-center px-2")}>
								<Breadcrumb className="px-2 md:px-4 ">
									<BreadcrumbList>
										<BreadcrumbItem>
											<BreadcrumbLink href="/medibook" className="flex gap-2 items-center">
												<Image alt="Mini MediBook Logo" src={MiniLogo} />
												<BreadcrumbPage className={cn("md:block", !hideBreadcrums && "hidden")}>MediBook</BreadcrumbPage>
											</BreadcrumbLink>
										</BreadcrumbItem>
										{!hideBreadcrums && (
											<>
												<BreadcrumbSeparator />
												<BreadcrumbItem>
													<BreadcrumbLink href={buttonHref}>{buttonText}</BreadcrumbLink>
												</BreadcrumbItem>
												<BreadcrumbSeparator />
												<BreadcrumbItem>
													<BreadcrumbPage>{title}</BreadcrumbPage>
												</BreadcrumbItem>
											</>
										)}
									</BreadcrumbList>
								</Breadcrumb>
							</div>
							<div className="h-full md:hidden aspect-square flex align-middle justify-center items-center border-l border-sidebar-border ml-auto min-w-[65px]">
								<SidebarTrigger />
							</div>
							<div
								className={cn(
									"min-h-[65px] flex items-center bg-sidebar-primary-foreground",
									isSearchActive ? "translate-y-[0px] duration-300" : "translate-y-[65px] duration-300"
								)}>
								<SInput
									ref={searchInputRef}
									onChange={(e) => updateSearchParams({ search: e.target.value })}
									value={searchParams ? (searchParams.get("search") ?? "") : ""}
									placeholder="Search..."
									type="search"
									className="h-full mx-2 border-0 shadow-none rounded-none focus-visible:ring-0"
								/>
							</div>
						</div>
						{isSearchActive && (
							<div className="h-full flex items-center border-b justify-center aspect-square border-l border-sidebar-border min-w-[65px]">
								<Button
									onClick={() => {
										if (isSearchActive) {
											removeSearchParams({ search: "" });
										} else {
											updateSearchParams({ search: "" });
											if (searchInputRef?.current) {
												searchInputRef.current.focus();
											}
										}
									}}
									title="Search"
									data-sidebar="trigger"
									variant="ghost"
									size="icon"
									className={cn("h-8 w-8", className)}>
									{isSearchActive ? <X className="-ml-[1px]" /> : <Search className="-ml-[1px]" />}
									<span className="sr-only">Search</span>
								</Button>
							</div>
						)}
					</div>
				</div>
			</header>
			<div
				ref={spacerRef}
				id="clientTopbar"
				className={cn(
					"flex bg-sidebar-accent w-full dark:bg-sidebar-accent md:w-full right-0 top-0 p-7 border-b border-sidebar-border flex-wrap items-end z-[10] justify-between gap-4",
					className
				)}>
				<div className="w-full sm:flex-1">
					{buttonText && buttonHref && (
						<FastLink href={buttonHref}>
							<div className="text-sm -ml-[2px] -mt-1 leading-none flex max-w-min">
								<ChevronLeft className="size-4 m-auto" />
								<Text className="mr-[11px] min-w-max text-sm">{buttonText}</Text>
							</div>
						</FastLink>
					)}
					{title && (
						<div>
							<div className="flex gap-2 align-items-center">
								<h1 className="md:text-2xl text-2xl font-semibold">{title}</h1>
							</div>
							{subheading && <h2 className="text-base font-semibold font-[Gilroy] text-muted-foreground">{subheading}</h2>}
						</div>
					)}
					<div className={cn("flex flex-col gap-4 md:flex-row", (!hideSearchBar || sortOptions) && "mt-4")}>
						{!hideSearchBar && (
							<div className="w-full flex-1">
								<SInput
									className="bg-white dark:bg-black"
									ref={searchInputRef}
									onChange={(e) => updateSearchParams({ search: e.target.value })}
									value={searchParams ? (searchParams.get("search") ?? "") : ""}
									placeholder="Search..."
									type="search"
								/>
							</div>
						)}
						{sortOptions && (
							<div>
								<DirectionDropdown className="bg-white dark:bg-black" items={sortOptions} defaultValue={defaultSort} />
							</div>
						)}
					</div>
				</div>
				{(children || config) && (
					<div className="grid w-full grid-cols-1 gap-4 md:flex md:w-auto md:flex-row">
						{children}
						{config && <Button onClick={() => setConfigShown(!configShown)}>Options</Button>}
					</div>
				)}
			</div>
		</>
	);
}
