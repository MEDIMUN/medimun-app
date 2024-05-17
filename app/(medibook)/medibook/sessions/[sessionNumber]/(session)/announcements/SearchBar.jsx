"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { Input } from "@nextui-org/react";
import { updateSearchParams, removeSearchParams } from "@/lib/searchParams";
import { useEffect } from "react";
import { Spacer } from "@nextui-org/react";

export default function SearchBar({ className }) {
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 500);

	useEffect(() => {
		if (debounced) {
			updateSearchParams({ query: debounced, page: 1 });
		} else {
			removeSearchParams({ query: "" }, router);
		}
	}, [debounced]);

	return (
		<>
			<Input
				className="w-full rounded-2xl border-1 border-gray-200 md:col-span-1 lg:col-span-2 xl:col-span-3"
				placeholder="Search"
				label=""
				isClearable
				onClear={() => {
					removeSearchParams({ query: "" }, router);
					setQuery("");
				}}
				labelPlacement="outside"
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
				}}
			/>
			<Spacer y={4} />
		</>
	);
}
