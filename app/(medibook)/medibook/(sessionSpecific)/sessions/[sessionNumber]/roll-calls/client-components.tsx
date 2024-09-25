"use client";

import { updateSearchParams } from "@/lib/searchParams";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Select } from "@/components/select";
import { DropdownItem } from "@/components/dropdown";
import { moveRollCallDown, moveRollCallUp } from "./actions";

export function MoveUpButton({ rcId }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function handleOnPress() {
		setIsLoading(true);
		const res = await moveRollCallUp(rcId);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}
	return (
		<DropdownItem disabled={isLoading} onClick={handleOnPress}>
			Move Up
		</DropdownItem>
	);
}

export function MoveDownButton({ rcId }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function handleOnPress() {
		setIsLoading(true);
		const res = await moveRollCallDown(rcId);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}
	return (
		<DropdownItem disabled={isLoading} onClick={handleOnPress}>
			Move Down
		</DropdownItem>
	);
}

export function DateSelector({ conferenceDays, workshopDays, className, ...others }) {
	const searchParams = useSearchParams();
	const router = useRouter();

	function onSelectionChange(e: { target: { value: any } }) {
		updateSearchParams({ "selected-day": e.target.value }, router);
	}
	return (
		<Select {...others} value={searchParams.get("selected-day")} onChange={onSelectionChange}>
			{!!conferenceDays.length && (
				<>
					<option disabled value="conference">
						Conference Days
					</option>
					{conferenceDays.map((day) => (
						<option key={day.id} value={day.id}>
							{day.name || day.title} ({day.date.toLocaleString("en-GB").slice(0, 10)})
						</option>
					))}
				</>
			)}
			{!!workshopDays.length && (
				<>
					<option disabled value="workshop">
						Workshop Days
					</option>
					{workshopDays.map((day) => (
						<option key={day.id} value={day.id}>
							{day.name || day.title} ({day.date.toLocaleString("en-GB").slice(0, 10)})
						</option>
					))}
				</>
			)}
		</Select>
	);
}
