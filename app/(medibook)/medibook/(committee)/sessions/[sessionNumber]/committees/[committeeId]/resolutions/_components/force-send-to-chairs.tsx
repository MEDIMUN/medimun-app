"use client";

import { DropdownItem } from "@/components/dropdown";
import { sendToChairsByChairs } from "../actions";
import { usePathname } from "next/navigation";

export function ForceSendToChairs({ resolutionId }) {
	const pathName = usePathname();
	return (
		<DropdownItem
			onClick={() => {
				sendToChairsByChairs({ resolutionId, pathName });
			}}>
			Send to next Stage
		</DropdownItem>
	);
}
