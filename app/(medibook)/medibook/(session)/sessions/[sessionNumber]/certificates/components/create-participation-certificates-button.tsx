"use client";

import { SearchParamsButton } from "@/app/(medibook)/medibook/client-components";
import { updateSearchParams } from "@/lib/search-params";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function CreateParticipationCertificatesButton() {
	const searchParams = useSearchParams();
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
	}, []);
	if (!isMounted) return null;

	if (!searchParams?.get("tab")) {
		updateSearchParams({ tab: "delegates" });
	}

	if (searchParams && searchParams.get("select") && searchParams.get("tab") !== "created")
		return <SearchParamsButton searchParams={{ "create-participation-certificates": true }}>Create Participation Certificates</SearchParamsButton>;
	return null;
}
