"use client";

import { DropdownItem } from "@/components/dropdown";
import { usePathname } from "next/navigation";
import { setAsAdopted } from "../actions";

export function SetAsAdopted({ resolutionId }) {
	const pathName = usePathname();
	return (
		<DropdownItem
			onClick={() => {
				setAsAdopted({ resolutionId, pathName });
			}}>
			Set as Adoped
		</DropdownItem>
	);
}
