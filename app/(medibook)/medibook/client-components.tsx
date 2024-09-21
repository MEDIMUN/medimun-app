"use client";

import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Heading, Subheading } from "@/components/heading";
import Icon from "@/components/icon";
import { Input, InputGroup } from "@/components/input";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Text } from "@/components/text";
import { useUpdateEffect } from "@/hooks/useUpdateEffect";
import { cn } from "@/lib/cn";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { EllipsisVerticalIcon, MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { useDebouncedValue } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useRouter as useNextRouter, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { toast } from "sonner";
import { authorizedToEditResource } from "./@resourceModals/default";

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
					<ListboxDescription>{option.description}</ListboxDescription>
				</ListboxOption>
			))}
		</Listbox>
	);
}

export function SearchBar({ placeholder = "Search...", debounceDelay = 500, defaultValue = "" }) {
	const router = useNextRouter();
	const [search, setSearch] = useState(defaultValue);
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
			<Input onChange={(e) => setSearch(e.target.value)} value={search} name="search" type="search" placeholder={placeholder} />
		</InputGroup>
	);
}

export function TopBar({
	className = "",
	title = "Title" as any,
	sortOptions,
	defaultSort = "nameasc",
	children,
	searchText = "Search...",
	hideSearchBar = false,
	subheading = "",
	buttonText = "",
	buttonHref = "",
}: {
	className?: string;
	title: string;
	sortOptions?: { value: string; order: string; label: string; description: string }[];
	defaultSort?: string;
	children?: React.ReactNode;
	searchText?: string;
	hideSearchBar?: boolean;
	subheading?: string;
	buttonText?: string;
	buttonHref?: string;
}) {
	sortOptions = sortOptions && sortOptions.map((option, index) => ({ ...option, key: index }));
	return (
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
				<Heading>{title}</Heading>
				<Subheading level={6} className="line-clamp-1 cursor-help !font-light duration-250 hover:line-clamp-none">
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
			{children && <div className="grid w-full grid-cols-1 gap-6 md:block md:w-auto">{children}</div>}
		</div>
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
	const resourceUrl = selectedResource.driveUrl ? `https://${selectedResource.id.driveUrl}` : `/medibook/resources/${selectedResource.id.id}`;

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
