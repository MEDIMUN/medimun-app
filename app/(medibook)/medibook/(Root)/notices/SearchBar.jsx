"use client";

import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useDebouncedState } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function SearchBar() {
	const [searchQuery, setSearchQuery] = useDebouncedState("", 300);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!searchQuery) router.replace(pathname);
		router.replace(pathname + "?search=" + searchQuery);
	}, [searchQuery]);

	return (
		<>
			<div className="mx-auto flex max-w-[1200px] flex-row">
				<Input
					defaultValue={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.currentTarget.value);
					}}
					type="search"
					placeholder="Search for older sessions"
					className="text-md w-full rounded-[4px]"
				/>
			</div>
		</>
	);
}
