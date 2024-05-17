"use client";

import { Pagination } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/lib/searchParams";

export default function Paginator(props) {
	const searchParams = useSearchParams();
	return <Pagination total={props.total} initialPage={1} page={searchParams.get("page") || 1} onChange={(page) => updateSearchParams({ page: page })} className="absolute bottom-10 mx-auto mt-auto" />;
}
