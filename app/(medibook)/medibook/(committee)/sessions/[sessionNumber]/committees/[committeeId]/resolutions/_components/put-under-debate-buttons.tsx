"use client";

import { DropdownDescription, DropdownItem } from "@/components/dropdown";
import { putUnderDebate } from "../actions";
import { usePathname } from "next/navigation";

export function PutUnderDebate({ resolutionId }) {
	const pathName = usePathname();
	return (
		<DropdownItem
			onClick={() => {
				putUnderDebate({ resolutionId, pathName });
			}}>
			Put under debate
			<DropdownDescription>and remove other resolution from debate</DropdownDescription>
		</DropdownItem>
	);
}
