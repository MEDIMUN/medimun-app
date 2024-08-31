"use client";

import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { Checkbox as CB } from "@nextui-org/checkbox";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelectedContext } from "./StateStateProvider";
import { maxNoOfSelected } from "../page";
import { Checkbox } from "@/components/checkbox";

const separator = "U";
const selectKeyword = "select";

export function UserSelector({ uid, officialName, displayName, ...props }) {
	const { selected, setSelected } = useSelectedContext();

	async function onSelectionChange(e) {
		if (e) {
			if (selected.length >= maxNoOfSelected) return;
			setSelected((prev) => [...prev, { id: uid, officialName, displayName }]);
		} else {
			if (selected.length == 1) {
				setSelected([]);
			} else {
				setSelected((prev) => prev.filter((item) => item.id !== uid));
			}
		}
	}

	useEffect(() => {
		if (selected.length) {
			updateSearchParams({ [selectKeyword]: selected.map((item) => item.id).join(separator) });
		} else {
			removeSearchParams({ [selectKeyword]: "" });
		}
	}, [selected]);

	const isSelected = selected.some((item) => item.id === uid);

	return <Checkbox disabled={selected.length >= maxNoOfSelected && !isSelected} {...props} checked={isSelected} onChange={onSelectionChange} />;
}
