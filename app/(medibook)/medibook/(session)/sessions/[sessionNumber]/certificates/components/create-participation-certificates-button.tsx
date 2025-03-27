"use client";

import { SearchParamsButton } from "@/app/(medibook)/medibook/client-components";
import { updateSearchParams } from "@/lib/search-params";
import { useSearchParams } from "next/navigation";

export function CreateParticipationCertificatesButton() {
	const searchParams = useSearchParams();

	if (!searchParams?.get("tab")) {
		updateSearchParams({ tab: "delegates" });
	}

	if (searchParams && searchParams.get("select") && searchParams.get("tab") !== "created")
		return <SearchParamsButton searchParams={{ "create-participation-certificates": true }}>Create Participation Certificates</SearchParamsButton>;
	return null;
}
