"use client";

import { Divider } from "@/components/divider";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Switch, SwitchField } from "@/components/switch";
import { useRef, useState, useEffect } from "react";
import {
	changePositionPaperSubmissiontatus,
	isPositionPaperSubmissionAutoOpenChangeAction,
	isPositionPaperSubmissionForceOpenChangeAction,
	isPositionPapersVisibleToEveryoneAction,
} from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@mantine/hooks";
import { useUpdateEffect } from "@/hooks/use-update-effect";
import { cn } from "@/lib/cn";

export function SubmissionOptions({ selectedCommittee }) {
	const formRef = useRef(null);

	// Separate state for each form field
	const [autoOpenTime, setAutoOpenTime] = useState(selectedCommittee.positionPaperSubmissionAutoOpenTime?.toISOString()?.slice(0, -1) || "");
	const [autoCloseTime, setAutoCloseTime] = useState(selectedCommittee.positionPaperSubmissionAutoCloseTime?.toISOString()?.slice(0, -1) || "");
	const [debouncedAutoOpenTime] = useDebouncedValue(autoOpenTime, 2000);
	const [debouncedAutoCloseTime] = useDebouncedValue(autoCloseTime, 2000);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Handle form submission
	async function handleSubmit() {
		setIsLoading(true);
		const formData = new FormData(formRef.current);
		const res = await changePositionPaperSubmissiontatus(formData, selectedCommittee.id);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleIsPositionPaperSubmissionForceOpenChange(e) {
		setIsLoading(true);
		const res = await isPositionPaperSubmissionForceOpenChangeAction(e, selectedCommittee.id);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleIsPositionPaperSubmissionAutoOpenChange(e) {
		setIsLoading(true);
		const res = await isPositionPaperSubmissionAutoOpenChangeAction(e, selectedCommittee.id);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleIsPositionPapersVisibleChange(e) {
		setIsLoading(true);
		const res = await isPositionPapersVisibleToEveryoneAction(e, selectedCommittee.id);
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
			<Divider className="invisible mb-5" />

			<SwitchField disabled={isLoading}>
				<Label>Position Paper Visibility</Label>
				<Description>When this is on, all accepted position papers will be visible to all delegates in the committee.</Description>
				<Switch
					name="isPositionPapersVisible"
					checked={selectedCommittee.isPositionPapersVisible}
					onChange={(e) => handleIsPositionPapersVisibleChange(e)}
				/>
			</SwitchField>

			<Divider className="my-5" />

			<SwitchField disabled={isLoading}>
				<Label>Force Submissions Open</Label>
				<Description>If this is on, the submissions will be open no matter the below schedule.</Description>
				<Switch
					name="isPositionPaperSubmissionForceOpen"
					checked={selectedCommittee.isPositionPaperSubmissionForceOpen}
					onChange={(e) => handleIsPositionPaperSubmissionForceOpenChange(e)}
				/>
			</SwitchField>

			<Divider className="my-5" />

			<SwitchField disabled={isLoading}>
				<Label>Scheduling</Label>
				<Description>When this is on, the below schedule will be respected.</Description>
				<Switch
					name="isPositionPaperSubmissionAutoOpen"
					checked={selectedCommittee.isPositionPaperSubmissionAutoOpen}
					onChange={(e) => handleIsPositionPaperSubmissionAutoOpenChange(e)}
				/>
			</SwitchField>

			<Divider
				className={cn(
					"mt-5",
					!selectedCommittee.isPositionPaperSubmissionAutoOpen && "invisible",
					selectedCommittee.isPositionPaperSubmissionAutoOpen && "mb-5"
				)}
			/>
			{selectedCommittee.isPositionPaperSubmissionAutoOpen && (
				<>
					<Field disabled={isLoading}>
						<Label>Opening Date</Label>
						<Description>When will the applications open.</Description>
						<Input
							type="datetime-local"
							name="PositionPaperSubmissionAutoOpenTime"
							value={autoOpenTime}
							onChange={(e) => setAutoOpenTime(e.target.value)}
						/>
					</Field>

					<Divider className="my-5" />

					<Field disabled={isLoading}>
						<Label>Closing Date</Label>
						<Description>When will the applications close.</Description>
						<Input
							type="datetime-local"
							name="PositionPaperSubmissionAutoCloseTime"
							value={autoCloseTime}
							onChange={(e) => setAutoCloseTime(e.target.value)}
						/>
					</Field>
					<Divider className="invisible mt-5" />
				</>
			)}
		</form>
	);
}
