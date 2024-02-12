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
			className="w-auto"
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
