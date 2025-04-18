"use client";

import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { useEffect } from "react";
import { useSelectedContext } from "./StateStateProvider";
import { Checkbox } from "@/components/checkbox";

const separator = ",";
const selectKeyword = "select";

export function UserSelector({ uid, officialName, displayName, maxNo = 25, ...props }) {
	const { selected, setSelected } = useSelectedContext();

	async function onSelectionChange(e) {
		if (e) {
			if (selected.length >= maxNo) return;
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

	return <Checkbox innerClassName="min-h-6 min-w-6" disabled={selected.length >= maxNo && !isSelected} {...props} checked={isSelected} onChange={onSelectionChange} />;
}
