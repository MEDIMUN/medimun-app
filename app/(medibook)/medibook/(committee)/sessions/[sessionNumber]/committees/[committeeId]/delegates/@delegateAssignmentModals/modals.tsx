"use client";

import { ReadonlyURLSearchParams, useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { editDelegateAssignment } from "./actions";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { SlugInput } from "@/components/slugInput";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Select } from "@/components/select";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/use-flush-state";
import { romanize } from "@/lib/romanize";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";
import { useState } from "react";
import { Info } from "lucide-react";

function onClose(searchParams: ReadonlyURLSearchParams, router: any[] | AppRouterInstance) {
	removeSearchParams({ "edit-delegate-assignment": "" }, router);
}

export function ModalEditDelegateAssignment({ selectedCommittee, allCountries, selectedDelegate }) {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	async function addCommitteeHandler(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await editDelegateAssignment({
			delegateId: selectedDelegate.id,
			countryCode: formData.get("type") as string,
			committeeId: selectedCommittee.id,
		});
		if (res?.ok) {
			toast.success(res?.message);
			onClose(searchParams, router);
		} else {
			toast.error(res?.message);
			router.refresh();
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.has("edit-delegate-assignment") && !!selectedCommittee;
	const fullName = selectedDelegate.user.displayName || `${selectedDelegate.user.officialName} ${selectedDelegate.user.officialSurname}`;
	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>
				Edit Assignment of {fullName} in {selectedCommittee.name}
			</DialogTitle>

			<DialogBody>
				<form id="edit-committee" action={addCommitteeHandler} className="flex flex-col gap-5">
					<Field>
						<Label>Country/Entity</Label>
						<Select defaultValue={selectedDelegate.country} required name="type">
							<option value="null">None</option>
							{allCountries.map((country) => {
								return (
									<option key={country.countryCode} value={country.countryCode}>
										{country.countryNameEn} ({country.countryCode})
									</option>
								);
							})}
						</Select>
					</Field>
				</form>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button loading={isLoading} form="edit-committee" type="submit">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}
