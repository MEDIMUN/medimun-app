"use client";

import { Pagination } from "@nextui-org/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/lib/searchParams";
import { useEffect } from "react";
import { InformationCircleIcon } from "@heroicons/react/16/solid";

export function Paginator({
	totalItems,
	itemsPerPage,
	itemsOnPage,
	control,
	...props
}: {
	totalItems: number;
	itemsPerPage: number;
	itemsOnPage?: number;
	control;
}) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const currentPage = parseInt(searchParams.get("page")) || 1;

	function onChangeHandler(page) {
		updateSearchParams({ page: page }, router);
	}

	const total = Math.ceil(totalItems / itemsPerPage);

	useEffect(() => {
		if (itemsOnPage === 0 && currentPage !== 1) {
			updateSearchParams({ page: total }, router);
		}
	}, [currentPage, itemsOnPage, router, total]);

	if (itemsOnPage == 0 && currentPage == 1)
		return (
			<>
				<div className="mx-auto mt-4 rounded-md bg-zinc-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
						</div>
						<div className="ml-3 flex-1 md:flex md:justify-between">
							<p className="text-sm text-zinc-700">No results {searchParams.get("search") ? "found" : "yet"}.</p>
						</div>
					</div>
				</div>
				{/* <div className="mt-3 flex flex-col overflow-hidden rounded-md bg-zinc-50 shadow-sm md:flex-row">
					<p className="ml-6 mt-6 pr-12 text-xl md:text-2xl">
						This isn&apos;t as big of a crisis as you might think, you are probably just looking at the wrong session...
						<br />
						<span className="text-sm md:text-lg">You can change the session at the top of the sidebar on the left.</span>
					</p>
					<img
						src="/assets/delegate-cat.png"
						alt="No results found"
						className="ml-auto mr-2 mt-4 max-h-[400px] object-cover drop-shadow-lg duration-300 hover:translate-y-[550px] hover:scale-[500%]"
					/>
				</div> */}
			</>
		);

	if (total <= 1) return null;

	return (
		<div className="mt-10 flex w-full">
			<Pagination
				showControls
				className="mx-auto"
				variant="light"
				color="secondary"
				total={control.total || total}
				page={control.page || currentPage}
				onChange={control.onChange || onChangeHandler}
				{...props}
			/>
		</div>
	);
}

export default Paginator;
