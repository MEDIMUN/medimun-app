"use client";

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { updateSearchParams } from "@/lib/searchParams";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";

export function CommitteeDropdown({ params, committee, isManagement }) {
	const router = useRouter();

	function handleOnClickEditCommittee() {
		updateSearchParams({ "edit-committee": committee.id }, router);
		router.refresh();
	}

	function handleOnClickDeleteCommittee() {
		updateSearchParams({ "delete-committee": committee.id }, router);
		router.refresh();
	}

	return (
		<Dropdown>
			<DropdownButton plain aria-label="More options">
				<EllipsisVerticalIcon />
			</DropdownButton>
			<DropdownMenu anchor="bottom end">
				<DropdownItem href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || committee.id}`}>View</DropdownItem>
				{isManagement && (
					<>
						<DropdownItem onClick={handleOnClickEditCommittee}>Edit</DropdownItem>
						<DropdownItem onClick={handleOnClickDeleteCommittee}>Delete</DropdownItem>
					</>
				)}
			</DropdownMenu>
		</Dropdown>
	);
}
