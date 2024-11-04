"use client";

import Icon from "@/components/icon";
import { toast } from "sonner";

export function UserIdDisplay({ userId }): string | null {
	//userId has 12 characters
	//needs to be displayed as 4-4-4

	if (!userId) return null;
	if (userId.length !== 12) return userId;

	const firstPart = userId.slice(0, 4);
	const secondPart = userId.slice(4, 8);
	const thirdPart = userId.slice(8, 12);

	function onClickHandler() {
		toast.success("User ID copied to clipboard");
		navigator.clipboard.writeText(userId);
	}

	return (
		<span className="flex">
			<span>
				{firstPart}
				<span className="select-none">-</span>
				{secondPart}
				<span className="select-none">-</span>
				{thirdPart}
			</span>
			<Icon icon="solar:copy-outline" className="my-auto ml-1 cursor-pointer text-zinc-500 hover:text-zinc-700" onClick={onClickHandler} />
		</span>
	);
}
