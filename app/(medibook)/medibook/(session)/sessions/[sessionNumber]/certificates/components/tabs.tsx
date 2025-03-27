"use client";

import { Tabs } from "@/components/ui/tabs";
import { updateSearchParams } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";

export function CertificateTabs({ children }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	function onChange(value) {
		updateSearchParams({ tab: value }, router);
	}

	return (
		<Tabs onValueChange={onChange} value={searchParams.get("tab") ?? "delegates"}>
			{children}
		</Tabs>
	);
}
