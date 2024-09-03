"use client";

import { useRouter } from "next/navigation";
import { updateSearchParams } from "@/lib/searchParams";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";

export function OptionsDropdown({ username, id }) {
	const router = useRouter();
	return (
		<Dropdown>
			<DropdownButton plain aria-label="More options">
				<EllipsisHorizontalIcon />
			</DropdownButton>
			<DropdownMenu>
				<DropdownItem onClick={() => router.push(`/medibook/users/${username || id}`)}>View Profile</DropdownItem>
				<DropdownItem
					onClick={() => {
						updateSearchParams({ edituser: id }, router);
						router.refresh();
					}}>
					Edit user
				</DropdownItem>
				<DropdownItem
					onClick={() => {
						updateSearchParams({ assignroles: id }, router);
						router.refresh();
					}}>
					Add roles
				</DropdownItem>
				<DropdownItem
					onClick={() => {
						updateSearchParams({ editroles: id }, router);
						router.refresh();
					}}>
					Edit roles
				</DropdownItem>
				<DropdownItem
					onClick={() => {
						updateSearchParams({ delete: id }, router);
						router.refresh();
					}}>
					Delete user
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}
