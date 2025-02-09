"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AutoRefresh({ interval = 15000 }) {
	const router = useRouter();

	useEffect(() => {
		const intervalId = setInterval(() => {
			router.refresh();
		}, interval);

		return () => clearInterval(intervalId);
	}, [interval, router]);

	return null;
}
