"use client";

import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Heading, Subheading } from "@/components/heading";
import Icon from "@/components/icon";
import { Input, InputGroup } from "@/components/input";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Text } from "@/components/text";
import { useUpdateEffect } from "@/hooks/use-update-effect";
import { cn } from "@/lib/cn";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { EllipsisVerticalIcon, MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { useDebouncedValue } from "@mantine/hooks";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useRouter as useNextRouter, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { toast } from "sonner";
import { authorizedToEditResource } from "./@resourceModals/default";
import { Divider } from "@/components/divider";
import { useSocket } from "@/contexts/socket";
import { Spinner } from "@nextui-org/spinner";
import { Tooltip } from "@nextui-org/tooltip";
import { Card } from "@nextui-org/card";
import { User } from "@nextui-org/user";
import { fetchUserForTooltip } from "./actions";
import { countries } from "@/data/countries";
import { Badge } from "@/components/badge";

export function DirectionDropdown({ defaultValue, items }) {
	const router = useNextRouter();
	const searchParams = useSearchParams();

	function handleOnChange(value) {
		updateSearchParams({ order: value.value, direction: value.order }, router);
	}

	const value =
		items.find((item) => item.value + item.order === searchParams.get("order") + searchParams.get("direction")) ||
		items.find((item) => item.value + item.order === defaultValue);

	return (
		<Listbox
			onChange={handleOnChange}
			value={value}
			defaultValue={items.find((item) => item.value + item.order === defaultValue)}
			className="w-full"
			aria-label="Sort By">
			{items.map((option, index) => (
				<ListboxOption key={index} value={option}>
					<ListboxLabel>{option.label}</ListboxLabel>
					<ListboxDescription>{option.description ? option.description : option.order.includes("asc") ? "↑" : "↓"}</ListboxDescription>
				</ListboxOption>
			))}
		</Listbox>
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
		<InputGroup className="w-full">
			<MagnifyingGlassIcon />
			<Input className={className} onChange={(e) => setSearch(e.target.value)} value={search} name="search" type="search" placeholder={placeholder} />
		</InputGroup>
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
	buttonText = "",
	buttonHref = "",
	showDivider = false,
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
}) {
	sortOptions = sortOptions && sortOptions.map((option, index) => ({ ...option, key: index }));
	return (
		<>
			<div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
				<div className="w-full sm:flex-1">
					{buttonText && buttonHref && (
						<Link href={buttonHref}>
							<div className="-ml-2 flex max-w-min cursor-pointer rounded-full from-gray-100 to-gray-300 duration-300 hover:bg-gradient-to-r hover:shadow-sm">
								<Icon
									icon="majesticons:chevron-left"
									height={18}
									width={18}
									className="my-auto ml-1 min-h-5 min-w-5 -translate-y-[0.5px] text-zinc-400"
								/>
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
								<SearchBar placeholder={searchText} />
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

export function SearchParamsButton({ searchParams, useRouter = true, ...params }) {
	const router = useNextRouter();

	function handleOnClick() {
		updateSearchParams(searchParams, useRouter ? router : null);
		router.refresh();
	}

	// @ts-ignore
	return <Button onClick={() => handleOnClick()} {...params} />;
}

export function SocketHandler() {
	const socket = useSocket();
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
	useLayoutEffect(() => {
		if (notConnectedFor30Seconds) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
	}, [notConnectedFor30Seconds]);

	useLayoutEffect(() => {
		const timer = setTimeout(() => {
			if (!isConnected) {
				toast.dismiss("internet-connection");
				setNotConnectedFor30Seconds(true);
			}
		}, 30000);
		return () => clearTimeout(timer);
	}, [isConnected]);

	if (notConnectedFor30Seconds && 0)
		//FIXME: remove 0
		return (
			<div className="w-full h-screen fixed z-[100] text-left bg-zinc-900/50 backdrop-blur-sm">
				<div className="mx-auto  flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 sm:py-64 lg:px-8">
					<h1 className="mt-5 text-pretty text-5xl font-semibold tracking-tight text-white sm:text-6xl max-w-max p-2 -ml-2 rounded-md bg-primary">
						No Internet Connection
					</h1>
					<p className="mt-6 text-pretty text-lg font-medium text-white sm:text-xl/8">MediBook requires an active internet connection.</p>
					<p className="mt-6 text-pretty text-lg font-medium text-white sm:text-xl/8">
						This also happens after app updates, please refresh the page to reconnect if you are sure you have an active internet connection.
					</p>
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
					<User
						name={fullName}
						description={user?.currentRoleNames[0] || "No role"}
						avatarProps={{ src: `/api/users/${userId}/avatar`, showFallback: true, isBordered: true, size: "sm", radius: "md" }}
					/>
					<div className="gap-2 flex ml-auto">
						<Button disabled color="primary" className="h-8 my-auto" onClick={() => setIsOpen(false)}>
							Message
						</Button>
						<Button href={`/medibook/users/${user?.username || user?.id}`} className="h-8 my-auto" onClick={() => setIsOpen(false)}>
							Profile
						</Button>
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
				<div>
					<Text>{user?.bio}</Text>
				</div>
			</div>
		);
	}

	return (
		<Tooltip
			shouldCloseOnInteractOutside={true}
			shouldCloseOnBlur={true}
			delay={1000}
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
	const resourceUrl = selectedResource.driveUrl
		? `https://${selectedResource.id.driveUrl}`
		: `https://www.medimun.org/resources/${selectedResource.id}`;

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
				<EllipsisVerticalIcon />
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

export function SearchParamsDropDropdownItem({
	searchParams,
	url,
	useRouter = true,
	...params
}: {
	searchParams: Object;
	url?: string;
	useRouter?: boolean;
	children: React.ReactNode;
}) {
	const router = useNextRouter();

	//if dev http://localhost, if prod https://www.medimun.org

	function handleOnClick() {
		const domain = process.env.NODE_ENV === "development" ? "http://localhost" : "https://www.medimun.org";
		if (url) {
			const baseUrl = new URL(url ? `${domain}/${url}` : window.location.href);
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
