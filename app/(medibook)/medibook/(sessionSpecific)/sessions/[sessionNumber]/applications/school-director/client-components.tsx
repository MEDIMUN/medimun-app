"use client";

import { Divider } from "@/components/divider";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Switch, SwitchField } from "@/components/switch";
import { useRef, useState, useEffect } from "react";
import {
	changeSchoolDirectorApplicationStatus,
	isSchoolDirectorApplicationsAutoOpenChangeAction,
	isSchoolDirectorApplicationsForceOpenChangeAction,
} from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@mantine/hooks";
import { useUpdateEffect } from "@/hooks/useUpdateEffect";
import { cn } from "@/lib/cn";

export function ApplicationOptions({ selectedSession }) {
	const formRef = useRef(null);

	// Separate state for each form field
	const [autoOpenTime, setAutoOpenTime] = useState(selectedSession.schoolDirectorApplicationsAutoOpenTime.toISOString().slice(0, -1) || "");
	const [autoCloseTime, setAutoCloseTime] = useState(selectedSession.schoolDirectorApplicationsAutoCloseTime.toISOString().slice(0, -1) || "");
	const [debouncedAutoOpenTime] = useDebouncedValue(autoOpenTime, 2000);
	const [debouncedAutoCloseTime] = useDebouncedValue(autoCloseTime, 2000);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Handle form submission
	async function handleSubmit() {
		setIsLoading(true);
		const formData = new FormData(formRef.current);
		const res = await changeSchoolDirectorApplicationStatus(formData, selectedSession.number);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleIsSchoolDirectorApplicationsForceOpenChange(e) {
		setIsLoading(true);
		const res = await isSchoolDirectorApplicationsForceOpenChangeAction(e, selectedSession.number);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleIsSchoolDirectorApplicationsAutoOpenChange(e) {
		setIsLoading(true);
		const res = await isSchoolDirectorApplicationsAutoOpenChangeAction(e, selectedSession.number);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	// Handle state changes (on form change)
	useUpdateEffect(() => {
		handleSubmit();
	}, [debouncedAutoOpenTime, debouncedAutoCloseTime]);

	return (
		<form ref={formRef} className="rounded-lg bg-zinc-100 px-4 shadow-sm ring-1 ring-zinc-950/10" onSubmit={handleSubmit}>
			<Divider className="invisible mb-10" />

			<SwitchField disabled={!selectedSession.isCurrent || isLoading}>
				<Label>Force Applications Open</Label>
				<Description>If this is on, the applications will be open no matter the below schedule.</Description>
				<Switch
					name="isSchoolDirectorApplicationsForceOpen"
					checked={selectedSession.isSchoolDirectorApplicationsForceOpen}
					onChange={(e) => handleIsSchoolDirectorApplicationsForceOpenChange(e)}
				/>
			</SwitchField>

			<Divider className="my-10" />

			<SwitchField disabled={!selectedSession.isCurrent || isLoading}>
				<Label>Scheduling</Label>
				<Description>When this is on, the below schedule will be respected.</Description>
				<Switch
					name="isSchoolDirectorApplicationsAutoOpen"
					checked={selectedSession.isSchoolDirectorApplicationsAutoOpen}
					onChange={(e) => handleIsSchoolDirectorApplicationsAutoOpenChange(e)}
				/>
			</SwitchField>

			<Divider
				className={cn(
					"mt-10",
					!selectedSession.isSchoolDirectorApplicationsAutoOpen && "invisible",
					selectedSession.isSchoolDirectorApplicationsAutoOpen && "mb-10"
				)}
			/>
			{selectedSession.isSchoolDirectorApplicationsAutoOpen && (
				<>
					<Field disabled={!selectedSession.isCurrent || isLoading}>
						<Label>Opening Date</Label>
						<Description>When will the applications open.</Description>
						<Input
							type="datetime-local"
							name="schoolDirectorApplicationsAutoOpenTime"
							value={autoOpenTime}
							onChange={(e) => setAutoOpenTime(e.target.value)}
						/>
					</Field>

					<Divider className="my-10" />

					<Field disabled={!selectedSession.isCurrent || isLoading}>
						<Label>Closing Date</Label>
						<Description>When will the applications close.</Description>
						<Input
							type="datetime-local"
							name="schoolDirectorApplicationsAutoCloseTime"
							value={autoCloseTime}
							onChange={(e) => setAutoCloseTime(e.target.value)}
						/>
					</Field>

					<Divider className="invisible mt-10" />
				</>
			)}
		</form>
	);
}
