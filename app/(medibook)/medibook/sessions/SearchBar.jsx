"use client";

import { Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { useRouter } from "next/navigation";

export default function SearchBar(props) {
	const [query, setQuery] = useState(props.query || "");
	const [debounced] = useDebouncedValue(query, 500);
	const router = useRouter();

	useEffect(() => {
		if (debounced) {
			updateSearchParams(router, { query: debounced, page: 1 });
		} else {
			removeSearchParams(router, { query: "" });
		}
	}, [debounced]);

	return <Input isClearable value={query} onValueChange={setQuery} label="" labelPlacement="outside" className="w-auto" placeholder="Search" />;
}
