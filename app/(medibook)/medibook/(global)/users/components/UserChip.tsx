"use client";

import { Avatar } from "@nextui-org/avatar";
import { useSelectedContext } from "./StateStateProvider";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/badge";

export function UserChip({ uid, officialName, displayName }) {
	const { setSelected } = useSelectedContext();
	function onClickHandler() {
		setSelected((prev) => prev.filter((item) => item.id !== uid));
	}

	return (
		<Badge className="cursor-pointer hover:bg-primary hover:text-white hover:line-through" onClick={onClickHandler} key={uid}>
			<Avatar showFallback className="my-auto h-4 w-4 bg-primary text-white shadow-md" src={`/api/users/${uid}/avatar`} />
			{displayName || officialName}
		</Badge>
	);
}
