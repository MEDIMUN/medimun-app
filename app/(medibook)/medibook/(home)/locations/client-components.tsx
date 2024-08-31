"use client";

import { useRouter } from "next/navigation";
import { updateSearchParams } from "@/lib/searchParams";
import { Dropdown, DropdownButton, DropdownHeading, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";

export function OptionsDropdown({ location }) {
	const router = useRouter();
	return (
		<Dropdown>
			<DropdownButton plain aria-label="More options">
				<EllipsisHorizontalIcon />
			</DropdownButton>
			<DropdownMenu>
				<DropdownItem onClick={() => router.push(`/medibook/locations/${location.slug || location.id}`)}>View Location Page</DropdownItem>
				<DropdownItem
					onClick={() => {
						updateSearchParams({ "edit-location": location.id }, router);
						router.refresh();
					}}>
					Edit & View Details
				</DropdownItem>
				<DropdownItem
					onClick={() => {
						updateSearchParams({ "delete-location": location.id }, router);
						router.refresh();
					}}>
					Delete Location
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}

export function EditDeleteLocationButtons({ locationId }) {
	const router = useRouter();
	return (
		<div className="flex gap-4">
			<Button
				onClick={() => {
					updateSearchParams({ "delete-location": locationId }, router);
					router.refresh();
				}}
				outline>
				Delete
			</Button>
			<Button
				onClick={() => {
					updateSearchParams({ "edit-location": locationId }, router);
					router.refresh();
				}}>
				Edit
			</Button>
		</div>
	);
}
