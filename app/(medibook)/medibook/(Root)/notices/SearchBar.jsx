"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { Input } from "@nextui-org/react";
import { updateSearchParams, removeSearchParams } from "@/lib/searchParams";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function SearchBar({ className }) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 500);

	useEffect(() => {
		if (debounced) {
			updateSearchParams(router, { query: debounced, page: 1 });
		} else {
			removeSearchParams(router, { query: "" });
		}
	}, [debounced]);

	return (
		<Input
			className={cn("w-full rounded-2xl border-1 border-gray-200 md:col-span-1 lg:col-span-2 xl:col-span-3" + className)}
			placeholder="Search"
			label=""
			isClearable
			onClear={() => {
				removeSearchParams(router, { query: "" });
				setQuery("");
			}}
			labelPlacement="outside"
			value={query}
			onChange={(e) => {
				setQuery(e.target.value);
			}}
		/>
	);
}
