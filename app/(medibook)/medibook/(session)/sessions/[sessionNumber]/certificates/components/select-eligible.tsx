"use client";

import { useSelectedContext } from "@/app/(medibook)/medibook/(global)/users/components/StateStateProvider";
import { Button } from "@/components/button";
import { useSearchParams } from "next/navigation";

export function SelectEligibleWindow({ eligibleDelegatesorMembers }) {
	const { selected, setSelected } = useSelectedContext();
	const searchParams = useSearchParams();
	function onClickHandler() {
		setSelected(eligibleDelegatesorMembers);
	}

	if (["delegates", "members"].includes(searchParams.get("tab")) && selected !== eligibleDelegatesorMembers) return <Button onClick={onClickHandler}>Select Eligible</Button>;
}
