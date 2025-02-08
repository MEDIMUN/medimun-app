"use client";

import { DropdownItem } from "@/components/dropdown";
import { makeDraftAgain } from "../actions";
import { usePathname } from "next/navigation";

export function MakeDraftAgainButton({ resolutionId }) {
	const pathName = usePathname();
	return (
		<DropdownItem
			onClick={() => {
				makeDraftAgain({ resolutionId, pathName });
			}}>
			Make Draft Again
		</DropdownItem>
	);
}
