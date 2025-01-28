"use client";

import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { Subheading } from "@/components/heading";
import { Select } from "@/components/select";
import { Text } from "@/components/text";
import { useState } from "react";
import { applyAsSchoolDirector } from "./actions";
import { romanize } from "@/lib/romanize";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ApplySchoolDirectorForm({ schools, selectedSession }) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function handleSchoolDirectorApply(formData) {
		setIsLoading(true);
		const res = await applyAsSchoolDirector(formData, selectedSession.id);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	return (
		<form action={handleSchoolDirectorApply}>
			<Divider className="my-10" />
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>School</Subheading>
					<Text>
						Select the school you would like to apply have the director role for for Session {romanize(parseInt(selectedSession.sessionNumber))}.
					</Text>
				</div>
				<div className="my-auto grid grid-cols-1 gap-6">
					<Select disabled={isLoading} defaultValue={"sel"} required name="schoolId">
						<option disabled value="sel">
							Select a school
						</option>
						{schools.map((school) => (
							<option key={school.id} value={school.id}>
								{school.name}
							</option>
						))}
					</Select>
				</div>
			</section>
			<Divider className="my-10" />
			<div id="notice" className="flex justify-end gap-4">
				<Button type="submit">Apply</Button>
			</div>
		</form>
	);
}
