"use client";

import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Divider } from "@/components/divider";
import { Description, Field, Fieldset, Label, Legend } from "@/components/fieldset";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/components/text";
import { Radio, RadioField, RadioGroup } from "@/components/radio";
import { useState } from "react";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Committee, Prisma } from "@prisma/client";
import { Select } from "@/components/select";
import { createMediWriteResolution } from "./action";
import { Input } from "@/components/input";
import { toast } from "sonner";

type CommitteType = Prisma.CommitteeGetPayload<{
	include: {
		Topic: true;
	};
}>;

export function ModalCreateResolution({ resourcesOfUser, selectedCommittee }: { resourcesOfUser: any; selectedCommittee: CommitteType }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading, setIsFlushLoading] = useFlushState(false);
	const [selectedType, setSelectedType] = useState("mediwrite");

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		formData.append("committeeId", selectedCommittee.id);
		const res = await createMediWriteResolution(formData);
		if (res?.ok) {
			toast.success(res?.message);
			onClose();
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	function onClose() {
		removeSearchParams({ "add-committee-resolution": "", "delete-committee-resolution": "" }, router);
	}

	const isOpen = searchParams && searchParams.has("add-committee-resolution");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Create Committee Resolution</DialogTitle>
			<DialogDescription>
				Create a new resolution for the committee. You can invite co-submitters and add clases later. Only you and other co-submitters will be able to
				view and edit this resolution until it has been published by your chairs.
				<br />
				<br />
				<i>This is a feature we are currently testing, expect (a lot of) errors.</i>
				<br />
				<i>We recommend copying your resolution to an external document while writing it until the feature is fully tested.</i>
			</DialogDescription>
			<DialogBody onSubmit={handleSubmit} id="add-committee-resolution" className="flex flex-col gap-6" as="form">
				<Field>
					<Label required>Title</Label>
					<Description>This will not appear on the resolution.</Description>
					<Input required name="title" placeholder="My Awesome Resolution..." />
				</Field>
				<Field>
					<Label required>Resolution Topic</Label>
					<Select required name="topicId">
						{selectedCommittee.Topic.map((topic) => (
							<option key={topic.id} value={topic.id}>
								{topic.title}
							</option>
						))}
					</Select>
				</Field>
				{/* <div className="grid grid-cols-1 gap-4 rounded-lg bg-zinc-100 p-4 pb-10 shadow-md ring-1 ring-zinc-950/10">
					<Fieldset>
						<Legend>Resolution Type</Legend>
						<Text>
							Choose and Editor to create your resolution with. You should use the MediBook Resolution Writer unless you have a specific reason not
							to.<b className="text-red-500"> This can not be changed later.</b>
						</Text>
						<RadioGroup name="editor-type" onChange={(e) => setSelectedType(e)} value={selectedType}>
							<RadioField>
								<Radio value="mediwrite" />
								<Label>MediWrite Resolution Writer</Label>
								<Description>
									This will automatically format your resoution and you will be able to simultaneously write it with other co-submitters. Your
									resolution should follow a specific format and only made up of preambulatory and operative clauses. If your committee or resolution
									has a different format for resolutions please use the external link option or upload options.
								</Description>
							</RadioField>
							<div className="flex">
								<Divider className="my-auto w-[40%]" />
								<p className="w-[20%] text-center text-xs">OR</p>
								<Divider className="my-auto w-[45%]" />
							</div>
							<RadioField>
								<Radio value="external" />
								<Label>External Resource</Label>
								<Description>Use an external resource to you upload to your MediDrive and link to your resolution.</Description>
							</RadioField>
						</RadioGroup>
					</Fieldset>
				</div> */}
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				{selectedType === "mediwrite" ? (
					<Button disabled={isLoading} loading={isLoading} form="add-committee-resolution" type="submit">
						Create Resolution
					</Button>
				) : (
					<Button disabled={isLoading} onClick={() => updateSearchParams({ "add-committee-resolution": "external" })} plain>
						Next
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
}
