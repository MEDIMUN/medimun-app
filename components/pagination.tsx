"use client";

import { Pagination } from "@heroui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/lib/search-params";
import { useEffect } from "react";
import { Info } from "lucide-react";

export function Paginator({ totalItems, itemsPerPage = 10, itemsOnPage, customText, control, ...props }: { totalItems: number; itemsPerPage?: number; itemsOnPage?: number; customText?: string; control? }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const currentPage = parseInt(searchParams.get("page")) || 1;
	const pathname = usePathname();

	function onChangeHandler(page) {
		updateSearchParams({ page: page }, router);
	}

	const total = Math.ceil(totalItems / itemsPerPage);

	useEffect(() => {
		if (itemsOnPage === 0 && currentPage !== 1) {
			updateSearchParams({ page: total }, router);
		}
	}, [currentPage, itemsOnPage, router, total]);

	if (itemsOnPage == 0 && currentPage == 1) {
		if (pathname.includes("/medibook")) {
			return (
				<div className="mx-auto w-full rounded-md bg-zinc-100 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<Info size={18} aria-hidden="true" className="h-5 w-5 text-zinc-400" />
						</div>
						<div className="ml-3 flex-1 md:flex md:justify-between dark:text-black">{customText ? customText : <p className="text-sm text-zinc-700">No items {searchParams.get("search") ? "found" : "yet"}.</p>}</div>
					</div>
				</div>
			);
		}
		return (
			<div className="m-8">
				<div className="mx-auto w-full max-w-[400px] rounded-md bg-zinc-100 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<Info size={18} aria-hidden="true" className="h-5 w-5 text-zinc-400" />
						</div>
						<div className="ml-3 flex-1 md:flex md:justify-between dark:text-black">{customText ? customText : <p className="text-sm text-zinc-700 ">No items {searchParams.get("search") ? "found" : "yet"}.</p>}</div>
					</div>
				</div>
			</div>
		);
	}

	if (total <= 1) return null;

	return (
		<div className="mt-10 flex w-full">
			<Pagination showControls className="mx-auto" variant="light" color="secondary" total={control?.total || total} page={control?.page || currentPage} onChange={control?.onChange || onChangeHandler} {...props} />
		</div>
	);
}

export default Paginator;
