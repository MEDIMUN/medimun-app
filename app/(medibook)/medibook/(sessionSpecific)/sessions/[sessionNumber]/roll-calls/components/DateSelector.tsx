"use client";

import { cn } from "@/lib/cn";
import { updateSearchParams } from "@/lib/searchParams";
import { Chip } from "@nextui-org/chip";
import { Select, SelectItem, SelectSection } from "@nextui-org/select";
import { useRouter, useSearchParams } from "next/navigation";

export function DateSelector({ conferenceDays, workshopDays, className, ...others }) {
	const searchParams = useSearchParams();
	const router = useRouter();

	function onSelectionChange(e: { target: { value: any } }) {
		updateSearchParams({ day: e.target.value }, router);
	}
	return (
		<Select
			{...others}
			disallowEmptySelection
			selectedKeys={[searchParams.get("day")]}
			onChange={onSelectionChange}
			radius="full"
			className={cn("min-w-min", className)}>
			{!!conferenceDays.length && (
				<SelectSection title="Conference Days">
					{conferenceDays.map((day) => (
						<SelectItem hideSelectedIcon key={day.id} textValue={day.name || day.title} aria-label={day.name || day.title}>
							<div key={day.id} className="flex">
								{day.name || day.title}
								<Chip size="sm" className="ml-auto h-5 bg-primary text-white">
									{day.date.toLocaleString().slice(0, 10)}
								</Chip>
							</div>
						</SelectItem>
					))}
				</SelectSection>
			)}
			{!!workshopDays.length && (
				<SelectSection title="Workshop Days">
					{workshopDays.map((day) => (
						<SelectItem hideSelectedIcon key={day.id} textValue={day.name || day.title} aria-label={day.name || day.title}>
							<div key={day.id} className="flex">
								{day.name || day.title}
								<Chip size="sm" className="ml-auto h-5 bg-primary text-white">
									{day.date.toLocaleString().slice(0, 10)}
								</Chip>
							</div>
						</SelectItem>
					))}
				</SelectSection>
			)}
		</Select>
	);
}
