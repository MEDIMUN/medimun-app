"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { Input } from "@nextui-org/react";
import { updateSearchParams, removeSearchParams } from "@/lib/searchParams";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import Icon from "@/components/icon";

export default function SearchBar({ radius = "md", placeholder = "Search", className = "", ...others }) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 500);

	useEffect(() => {
		if (debounced) {
			updateSearchParams({ search: debounced, page: 1 }, router);
		} else {
			removeSearchParams({ search: "" }, router);
		}
	}, [debounced]);

	return (
		<Input
			{...others}
			radius={radius}
			size="lg"
			className={cn("w-full min-w-[256px]", className)}
			classNames={{ inputWrapper: "bg-content1/60 border border-black/10 dark:border-white/20" }}
			startContent={<Icon icon="solar:magnifer-outline" color="gray" width={20} />}
			placeholder={placeholder}
			isClearable
			onClear={() => {
				removeSearchParams({ search: "" }, router);
				setQuery("");
			}}
			value={query}
			onValueChange={setQuery}
		/>
	);
}
