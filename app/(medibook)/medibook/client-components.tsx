"use client";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Input, InputGroup } from "@/components/input";
import { Text, TextLink } from "@/components/text";
import { useUpdateEffect } from "@/hooks/use-update-effect";
import { cn } from "@/lib/cn";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { useDebouncedValue } from "@mantine/hooks";
import { signOut, useSession } from "next-auth/react";
import { useRouter as useNextRouter, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authorizedToEditResource } from "./@resourceModals/default";
import { useSocket } from "@/contexts/socket";
import { Spinner } from "@heroui/spinner";
import { Tooltip } from "@heroui/tooltip";
import { Input as SInput } from "@/components/ui/input";
import { User } from "@heroui/user";
import { fetchUserForTooltip } from "./actions";
import { countries } from "@/data/countries";
import { Badge } from "@/components/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronLeft, Clock, Ellipsis, Phone, Search, X } from "lucide-react";
import Image from "next/image";
import MiniLogo from "@/public/assets/branding/logos/miniaturelogo.svg";
import { FastLink } from "@/components/fast-link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heading, Subheading } from "@/components/heading";
import { Divider } from "@/components/divider";
import { FastLink as Link } from "@/components/fast-link";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "@/components/dialog";
import { TopBar as ToooopBar } from "@/components/top-bar";

export function TopBar(props) {
	return <ToooopBar {...props} />;
}

export function DirectionDropdown({ defaultValue, items, ...props }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	function handleOnChange(value: string) {
		const selectedItem = items.find((item) => item.value + item.order === value);
		if (selectedItem) {
			updateSearchParams({ order: selectedItem.value, direction: selectedItem.order }, router);
		}
	}

	const currentValue = items.find((item) => item.value + item.order === searchParams.get("order") + searchParams.get("direction")) || items.find((item) => item.value + item.order === defaultValue);

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

export function SearchBar({ placeholder = "Search...", debounceDelay = 500, defaultValue = "", className = "" }) {
	const router = useNextRouter();
	const searchParams = useSearchParams();
	const currentSearch = searchParams && searchParams.get("search");
	const [search, setSearch] = useState(currentSearch || defaultValue);
	const [debouncedSearch] = useDebouncedValue(search, debounceDelay);

	useEffect(() => {
		if (debouncedSearch) {
			updateSearchParams({ search: debouncedSearch }, router);
		} else {
			removeSearchParams({ search: "" }, router);
		}
	}, [debouncedSearch, router]);

	return (
		<InputGroup className={cn("w-full", className)}>
			<Input onChange={(e) => setSearch(e.target.value)} value={search} name="search" type="search" placeholder={placeholder} />
		</InputGroup>
	);
}

export function TopBar3({
	className = "",
	title = "" as any,
	sortOptions,
	defaultSort = "nameasc",
	children,
	searchText = "Search...",
	hideSearchBar = false,
	subheading = "",
	buttonText = "",
	buttonHref = "",
	showDivider = false,
	hideBackdrop = false,
}: {
	className?: string;
	title?: string;
	sortOptions?: { value: string; order: string; label: string; description?: string }[];
	defaultSort?: string;
	children?: React.ReactNode;
	searchText?: string;
	hideSearchBar?: boolean;
	subheading?: string;
	buttonText?: string;
	buttonHref?: string;
	showDivider?: boolean;
	hideBackdrop?: boolean;
}) {
	const [height, setHeight] = useState(0);

	useEffect(() => {
		setHeight(document.getElementById("clientTopbar").clientHeight);
	}, []);

	//listen to scroll resize navigation

	useEffect(() => {
		function handleResize() {
			setHeight(document.getElementById("clientTopbar").clientHeight);
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	sortOptions = sortOptions && sortOptions.map((option, index) => ({ ...option, key: index }));
	return (
		<>
			{!hideBackdrop && (
				<>
					<div
						style={{
							height: `${height + 24}px`,
							overflow: "hidden",
						}}
						className="flex-1 top-0 w-full md:block absolute hidden !overflow-x-hidden md:rounded-t-[8px] left-0 right-0 h-[131px] z-[1] border-b bg-zinc-100 dark:hidden"></div>
					<div
						style={{
							height: `${height + 3}px`,
							overflow: "hidden",
						}}
						className="flex-1 md:hidden top-0 w-full absolute !overflow-x-hidden md:rounded-t-[8px] left-0 right-0 h-[131px] z-[1] border-b bg-zinc-100 dark:bg-zinc-600"></div>
				</>
			)}
			<div id="clientTopbar" className={cn("flex flex-wrap items-end z-[10] justify-between gap-4", className)}>
				<div className="w-full sm:flex-1">
					{buttonText && buttonHref && (
						<Link href={buttonHref}>
							<div className="-ml-2 flex max-w-min cursor-pointer rounded-full from-gray-100 to-gray-300 duration-300 hover:bg-gradient-to-r hover:shadow-sm">
								<ChevronLeft height={18} width={18} className="my-auto ml-1 min-h-5 min-w-5 -translate-y-[0.5px] text-zinc-400" />
								<Text className="mr-[11px] min-w-max text-sm">{buttonText}</Text>
							</div>
						</Link>
					)}
					{title && <Heading>{title}</Heading>}
					<Subheading level={6} className="!font-light">
						{subheading}
					</Subheading>
					<div className={cn("flex flex-col gap-4 md:flex-row", (!hideSearchBar || sortOptions) && "mt-4")}>
						{!hideSearchBar && (
							<div className="w-full flex-1">
								<SearchBar className="shadow-sm rounded-xl" placeholder={searchText} />
							</div>
						)}
						{sortOptions && (
							<div>
								<DirectionDropdown items={sortOptions} defaultValue={defaultSort} />
							</div>
						)}
					</div>
				</div>
				{children && <div className="grid w-full grid-cols-1 gap-4 md:flex md:w-auto md:flex-row">{children}</div>}
			</div>

			{showDivider && <Divider soft />}
		</>
	);
}

export function TopBar2({
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
							<div className={cn("min-h-[65px] flex items-center bg-sidebar-primary-foreground", isSearchActive ? "translate-y-[0px] duration-300" : "translate-y-[65px] duration-300")}>
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
				className={cn("flex bg-sidebar-accent w-full dark:bg-sidebar-accent md:w-full right-0 top-0 p-7 border-b border-sidebar-border flex-wrap items-end z-[10] justify-between gap-4", className)}>
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

export function SearchParamsButton({ searchParams, deleteSearchParams, useRouter = true, ...params }: { searchParams?: Object; deleteSearchParams?: Object; useRouter?: boolean; children: React.ReactNode }) {
	const router = useNextRouter();

	function handleOnClick() {
		if (searchParams) updateSearchParams(searchParams, useRouter ? router : null);
		if (removeSearchParams) removeSearchParams(deleteSearchParams, useRouter ? router : null);
		router.refresh();
	}

	// @ts-ignore
	return <Button onClick={() => handleOnClick()} {...params} />;
}

export function SocketHandler() {
	const { socket } = useSocket();
	const router = useRouter();
	const [isConnected, setIsConnected] = useState(false);
	const [notConnectedFor30Seconds, setNotConnectedFor30Seconds] = useState(false);

	useEffect(() => {
		if (!socket) return;
		socket.on("toast", (args) => toast(args));
		socket.on("toast.success", (args) => toast.success(args));
		socket.on("toast.error", (args) => toast.error(args));
		socket.on("toast.info", (args) => toast.info(args));
		socket.on("toast.loading", (args) => toast.loading(args));
		socket.on("toast.dismiss", (args) => toast.dismiss(args));
		//
		socket.on("router.refresh", () => router.refresh());
		socket.on("router.push", (args) => router.push(args));
		socket.on("router.replace", (args) => router.replace(args));
		socket.on("router.back", () => router.back());
		//
		socket.on("signout", () => signOut);

		socket.on("disconnect", (reason) => {
			setIsConnected(false);
			if (socket.active) {
				toast.loading("You are not connected to the internet.", {
					description: "Trying to reconnect...",
					id: "internet-connection",
					dismissible: false,
				});
			} else {
				toast.error("You have been disconnected from the internet.", {
					description: "Trying to reconnect...",
					id: "internet-connection",
					dismissible: false,
				});
			}
		});
		socket.on("connect", () => {
			setIsConnected(true);
			if (notConnectedFor30Seconds) {
				toast.success("Reconnected to the internet.");
			}
			setNotConnectedFor30Seconds(false);
			toast.dismiss("internet-connection");
		});
	}, [socket]);

	//disable scroll when!isConnected
	/* 	useLayoutEffect(() => {
		if (notConnectedFor30Seconds) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
	}, [notConnectedFor30Seconds]); */

	useLayoutEffect(() => {
		const timer = setTimeout(() => {
			if (!isConnected) {
				toast.dismiss("internet-connection");
				setNotConnectedFor30Seconds(true);
			}
		}, 10000);
		return () => clearTimeout(timer);
	}, [isConnected]);

	if (notConnectedFor30Seconds && false)
		return (
			<div className="w-full h-screen fixed z-[100] text-left bg-zinc-900/50 backdrop-blur-sm">
				<div className="mx-auto  flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 sm:py-64 lg:px-8">
					<h1 className="mt-5 text-pretty text-5xl font-semibold tracking-tight text-white sm:text-6xl max-w-max p-2 -ml-2 rounded-md bg-primary">No Internet Connection</h1>
					<p className="mt-6 text-pretty text-lg font-medium text-white sm:text-xl/8">MediBook requires an active internet connection.</p>
					<p className="mt-6 text-pretty text-lg font-medium text-white sm:text-xl/8">This also happens after app updates, please refresh the page to reconnect if you are sure you have an active internet connection.</p>
					<div className="fixed p-4 w-full left-0 top-0 bg-white gap-4 flex">
						<Spinner size="sm" />
						Trying to reconnect...
					</div>
				</div>
			</div>
		);
	return null;
}

export function UserTooltip({ userId, children }) {
	const [isOpen, setIsOpen] = useState(false);
	const [user, setUser] = useState(null);
	const [isFetching, setIsFetching] = useState(false);

	async function handleFetchUser() {
		if (!userId) return;
		if (isFetching) return;
		setIsFetching(true);
		const res = await fetchUserForTooltip(userId);
		if (!res?.ok) {
			setUser(null);
			setIsOpen(false);
			return;
		}
		setUser(res.data.user);
		setIsFetching(false);
	}

	useEffect(() => {
		if (!isOpen) return;
		handleFetchUser();
	}, [isOpen]);

	const fullName = user?.displayName || `${user?.officialName} ${user?.officialSurname}`;

	const nationalityCountry = countries.find((c) => c.countryCode == user?.nationality);

	function Inside() {
		if (isFetching)
			return (
				<Text>
					<i>Loading...</i>
				</Text>
			);
		return (
			<div className="min-w-[380px] max-w-[500px] flex flex-col p-1 py-2 gap-1">
				<div className="flex p-1 gap-5">
					<User name={fullName} description={user?.currentRoleNames[0] || "No role"} avatarProps={{ src: `/api/users/${userId}/avatar`, showFallback: true, isBordered: true, size: "sm", radius: "md" }} />
					<div className="gap-2 flex ml-auto">
						<FastLink href={`/medibook/messenger/@${user?.username || user?.id}?new=true`}>
							<Button color="primary" className="h-8 my-auto">
								Message
							</Button>
						</FastLink>
						<FastLink href={`/medibook/users/${user?.username || user?.id}`}>
							<Button className="h-8 my-auto" onClick={() => setIsOpen(false)}>
								Profile
							</Button>
						</FastLink>
					</div>
				</div>
				<div className="flex gap-2 flex-wrap">
					<Badge>{user?.schoolName}</Badge>
					{nationalityCountry && (
						<Badge>
							{nationalityCountry?.flag} {nationalityCountry?.countryNameEn}
						</Badge>
					)}
					<Badge>{user?.isProfilePrivate ? "Private" : "Public"}</Badge>
				</div>
				{user?.bio && (
					<div>
						<Text>{user?.bio}</Text>
					</div>
				)}
				{(user?.phoneNumber || user?.bestTimeToReach) && (
					<div className="flex gap-2">
						{user?.phoneNumber && (
							<div className="flex gap-1">
								<Phone size={18} className="h-4 w-4 my-auto" />
								<Text className="my-auto">{user?.phoneNumber}</Text>
							</div>
						)}
						{user?.bestTimeToReach && (
							<div className="flex gap-1">
								<Clock size={18} className="h-4 w-4 my-auto" />
								<Text className="my-auto line-clamp-1">{user?.bestTimeToReach}</Text>
							</div>
						)}
					</div>
				)}
			</div>
		);
	}

	return (
		<Tooltip
			closeDelay={1000}
			shouldCloseOnInteractOutside={true}
			shouldCloseOnBlur={true}
			delay={500}
			showArrow
			isOpen={isOpen}
			onOpenChange={(open) => setIsOpen(open)}
			placement="top-start"
			className={cn("max-w-max cursor-pointer")}
			content={<Inside />}>
			{children}
		</Tooltip>
	);
}

const FileDownloader = ({ resourceId, fileName }) => {
	const downloadFile = async () => {
		try {
			toast.loading("Downloading file", { id: "downloadingFile" });
			const response1 = await fetch(`/api/resources/${resourceId}/url`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				signal: AbortSignal.timeout(100000),
			});
			const response1Json = await response1.json();
			const response = await fetch(response1Json.url);
			const blob = await fetch(response.url, { signal: AbortSignal.timeout(100000) }).then((res) => res.blob());
			const blobUrl = window.URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = blobUrl;
			anchor.download = fileName || "MEDIMUN File Download";
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			window.URL.revokeObjectURL(blobUrl);
		} catch (error) {
			toast.error("Failed to download file", { id: "downloadingFile" });
			return null;
		}
		toast.success("File downloaded successfully", { id: "downloadingFile" });
	};

	useUpdateEffect(() => {
		return () => {
			toast.error("Download cancelled", { id: "downloadingFile" });
		};
	}, []);

	return (
		<DropdownItem onClick={downloadFile} className="w-full">
			Download
		</DropdownItem>
	);
};

export function SessionResourceDropdown({ selectedResource }) {
	const router = useRouter();
	const { data: authSession, status } = useSession();
	const resourceUrl = selectedResource.driveUrl ? `https://${selectedResource.id.driveUrl}` : `https://www.medimun.org/resources/${selectedResource.id}`;

	const authorizedToEdit = status === "authenticated" && authorizedToEditResource(authSession, selectedResource);

	function handleOnClickEditResource() {
		updateSearchParams({ "edit-resource": selectedResource.id }, router);
		router.refresh();
	}

	function handleOnClickDeleteResource() {
		updateSearchParams({ "delete-resource": selectedResource.id }, router);
		router.refresh();
	}

	function shareHandler() {
		window.navigator.clipboard.writeText(resourceUrl);
		toast.success("Link copied to clipboard");
	}

	return (
		<Dropdown>
			<DropdownButton plain aria-label="More options">
				<Ellipsis width={18} />
			</DropdownButton>
			<DropdownMenu anchor="bottom end">
				<DropdownItem target="_blank" href={resourceUrl}>
					View
				</DropdownItem>
				{!selectedResource.driveUrl && <FileDownloader resourceId={selectedResource.id} fileName={selectedResource.name} />}
				<DropdownItem onClick={shareHandler}>Share</DropdownItem>
				{authorizedToEdit && (
					<>
						<DropdownItem onClick={handleOnClickEditResource}>Edit Details</DropdownItem>
						<DropdownItem onClick={handleOnClickDeleteResource}>Delete File</DropdownItem>
					</>
				)}
			</DropdownMenu>
		</Dropdown>
	);
}

export function SearchParamsDropDropdownItem({ searchParams, url, useRouter = true, ...params }: { searchParams: Object; url?: string; useRouter?: boolean; children: React.ReactNode }) {
	const router = useNextRouter();

	//if dev http://localhost, if prod https://www.medimun.org

	function handleOnClick() {
		const domain = process.env.NODE_ENV === "development" ? "https://localhost" : "https://www.medimun.org";
		if (url) {
			const baseUrl = new URL(url ? `${domain}${url}` : window.location.href);
			for (const [key, value] of Object.entries(searchParams)) {
				baseUrl.searchParams.set(key, value);
			}
			router.push(baseUrl.toString(), { scroll: false });
			router.refresh();
		} else {
			updateSearchParams(searchParams, useRouter ? router : null);
			router.refresh();
		}
	}
	return <DropdownItem onClick={handleOnClick} {...params} />;
}

export function ResourceViewer({ frameUrl }) {
	const [reloadAttempts, setReloadAttempts] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);
	const iframeRef = useRef(null);
	const MAX_RETRIES = 4;

	const reloadIframe = () => {
		if (iframeRef.current) {
			iframeRef.current.src = null;
			setTimeout(() => {
				iframeRef.current.src = frameUrl;
			}, 100);
		}
	};

	useEffect(() => {
		if (!isLoaded && reloadAttempts == MAX_RETRIES) {
			window.location.reload();
		}

		if (!isLoaded && reloadAttempts < MAX_RETRIES) {
			const interval = setInterval(() => {
				if (!isLoaded) {
					setReloadAttempts((prev) => prev + 1);
					reloadIframe();
				} else {
					clearInterval(interval);
					reloadIframe();
				}
			}, 2500);

			return () => clearInterval(interval);
		}
	}, [isLoaded, reloadAttempts]);

	useEffect(() => {
		setReloadAttempts(0);
		setIsLoaded(false);
		reloadIframe();
	}, [frameUrl]);

	return (
		<>
			<div className="bg-zinc-100 rounded-md overflow-scroll w-full min-h-screen">
				{!isLoaded && (
					<Text className="p-2">
						<i>Loading... (Attempt {reloadAttempts + 1} out of 5)</i>
					</Text>
				)}
				<iframe sandbox="allow-scripts allow-same-origin" ref={iframeRef} className="w-full min-h-screen" onLoad={() => setIsLoaded(true)} src={frameUrl} />
			</div>
			<Text>
				<i>
					If the document does not load, please click{" "}
					<TextLink target="_blank" href={frameUrl}>
						here
					</TextLink>{" "}
					to view it.
				</i>
			</Text>
		</>
	);
}
