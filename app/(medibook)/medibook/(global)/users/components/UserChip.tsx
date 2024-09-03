"use client";

import { Avatar } from "@nextui-org/avatar";
import { useSelectedContext } from "./StateStateProvider";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export function UserChip({ uid, officialName, displayName }) {
	const { setSelected } = useSelectedContext();
	function onClickHandler() {
		setSelected((prev) => prev.filter((item) => item.id !== uid));
	}

	return (
		<div
			onClick={onClickHandler}
			key={uid}
			className="flex cursor-pointer select-none justify-center gap-1 rounded-sm bg-neutral-200 p-1 pl-1 pr-2 align-middle text-sm shadow-sm duration-200 hover:bg-primary hover:text-white hover:line-through">
			<Avatar radius="full" size="sm" showFallback className="my-auto h-5 w-5 bg-primary text-white shadow-md" src={`/api/users/${uid}/avatar`} />
			<p className="my-auto">{displayName || officialName}</p>
		</div>
	);
}
