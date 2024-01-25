"use client";

import { Pagination } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Paginator(props) {
	const [page, setPage] = useState(1);
	const router = useRouter();

	useEffect(() => {
		router.push(`?page=${page}`);
	}, [page]);

	return <Pagination total={props.total} page={page} onChange={setPage} className="mx-auto mt-auto" />;
}
