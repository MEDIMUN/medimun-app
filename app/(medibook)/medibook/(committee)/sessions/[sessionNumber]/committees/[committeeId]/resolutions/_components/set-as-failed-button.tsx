"use client";

import { DropdownItem } from "@/components/dropdown";
import { usePathname } from "next/navigation";
import { setAsFailed } from "../actions";

export function SetAsFailed({ resolutionId }) {
	const pathName = usePathname();
	return (
		<DropdownItem
			onClick={() => {
				setAsFailed({ resolutionId, pathName });
			}}>
			Set as Failed
		</DropdownItem>
	);
}
