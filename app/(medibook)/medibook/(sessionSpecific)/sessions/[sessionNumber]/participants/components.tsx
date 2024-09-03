"use client";

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { updateSearchParams } from "@/lib/searchParams";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";

export function ParticipantsDropdown({ username, userId, isManagement }) {
	const router = useRouter();

	function handleOnClickEditUser() {
		updateSearchParams({ "edit-user": userId }, router);
		router.refresh();
	}

	function handleOnClickAssignRoles() {
		updateSearchParams({ assignroles: userId }, router);
		router.refresh();
	}

	function handleOnClickEditRoles() {
		updateSearchParams({ editroles: userId }, router);
		router.refresh();
	}

	function handleOnClickDeleteUser() {
		updateSearchParams({ deleteuser: userId }, router);
		router.refresh();
	}

	return (
		<Dropdown>
			<DropdownButton plain aria-label="More options">
				<EllipsisVerticalIcon />
			</DropdownButton>
			<DropdownMenu anchor="bottom end">
				<DropdownItem href={`/medibook/users/${username || userId}`}>View Profile</DropdownItem>
				{isManagement && (
					<>
						<DropdownItem onClick={handleOnClickEditUser}>Edit User</DropdownItem>
						<DropdownItem onClick={handleOnClickAssignRoles}>Assign Roles</DropdownItem>
						<DropdownItem onClick={handleOnClickEditRoles}>Edit Roles</DropdownItem>
						<DropdownItem onClick={handleOnClickDeleteUser}>Delete User</DropdownItem>
					</>
				)}
			</DropdownMenu>
		</Dropdown>
	);
}
