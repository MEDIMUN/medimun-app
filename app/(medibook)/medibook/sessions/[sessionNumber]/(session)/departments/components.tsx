"use client";

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { updateSearchParams } from "@/lib/searchParams";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";

export function DepartmentDropdown({ params, department, isManagement }) {
	const router = useRouter();

	function handleOnClickEditCommittee() {
		updateSearchParams({ editdepartment: department.id }, router);
		router.refresh();
	}

	function handleOnClickDeleteCommittee() {
		updateSearchParams({ deletedepartment: department.id }, router);
		router.refresh();
	}

	return (
		<Dropdown>
			<DropdownButton plain aria-label="More options">
				<EllipsisVerticalIcon />
			</DropdownButton>
			<DropdownMenu anchor="bottom end">
				<DropdownItem href={`/medibook/sessions/${params.sessionNumber}/departments/${department.slug || department.id}`}>View</DropdownItem>
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
