"use client";

import { Pagination } from "@nextui-org/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/lib/searchParams";

export function Paginator({ totalItems, itemsPerPage, ...props }) {
	const searchParams = useSearchParams();
	const router = useRouter();

	function onChangeHandler(page) {
		updateSearchParams({ page: page }, router);
	}
	const total = Math.ceil(totalItems / itemsPerPage);
	if (total <= 1) return null;
	return (
		<div className="mt-10 flex w-full">
			<Pagination
				showControls
				className="mx-auto"
				variant="light"
				color="secondary"
				total={total}
				page={parseInt(searchParams.get("page")) || 1}
				onChange={onChangeHandler}
				{...props}
			/>
		</div>
	);
}

export default Paginator;
