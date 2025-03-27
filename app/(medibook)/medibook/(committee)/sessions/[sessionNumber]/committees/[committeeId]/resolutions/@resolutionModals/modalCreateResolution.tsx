"use client";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Prisma } from "@prisma/client";
import { Select } from "@/components/select";
import { createMediWriteResolution } from "./action";
import { Input } from "@/components/input";
import { toast } from "sonner";
import { Textarea } from "@/components/textarea";
import { Badge } from "@/components/badge";
import AIProcessingAnimation from "./ai-processing-animation";

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
	const [processResolution, setProcessResolution] = useState("");

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		formData.append("committeeId", selectedCommittee.id);
		const processResolutionText = formData.get("processResolution") as string;
		setIsLoading(true);
		if (processResolutionText) {
			toast.loading("Processing pasted resolution...", { id: "processing-resolution" });
		}
		const res = await createMediWriteResolution(formData);
		if (res?.ok) {
			toast.success(res?.message, { id: "processing-resolution" });
			onClose();
		} else {
			toast.error(res?.message, { id: "processing-resolution" });
		}
		setIsLoading(false);
		if (res?.data) {
			router.push(res.data);
		} else {
			router.refresh();
		}
	}

	function onClose() {
		if (isLoading) return;
		removeSearchParams({ "add-committee-resolution": "", "delete-committee-resolution": "" }, router);
	}

	const isOpen = searchParams && searchParams.has("add-committee-resolution");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Create Committee Resolution</DialogTitle>

			<DialogBody onSubmit={handleSubmit} id="add-committee-resolution" className="flex flex-col gap-6" as="form">
				{isLoading && !!processResolution.trim().length && (
					<div className="max-w-md w-full font-[montserrat] space-y-8 bg-sidebar-primary p-8 rounded-xl">
						<div className="text-center">
							<h1 className="text-2xl font-bold font-[Canela] text-primary">
								MediAI <sup className="text-white">beta</sup>
							</h1>
							<p className="mt-2 text-gray-200">MediAI is formatting your resolution.</p>
						</div>
						<div className="flex justify-center py-8">
							<AIProcessingAnimation />
						</div>
						<div className="text-center text-sm text-gray-300 text-pretty max-w-[300px] mx-auto">This may take up to a minute depending on the length of the resolution.</div>
					</div>
				)}
				{!(isLoading && !!processResolution.trim().length) && (
					<>
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
						<Field>
							<Label optional>
								Process Previously Written Resolution <Badge color="purple">MediAI</Badge>
							</Label>
							<Description>If you have previously written your resolution in an external word processing app such as Microsoft Word, copy the whole resolution and paste it below to be processed by MediAI.</Description>
							<Textarea
								onChange={(e) => {
									setProcessResolution(e.target.value);
								}}
								name="processResolution"
							/>
						</Field>
					</>
				)}
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				{selectedType === "mediwrite" ? (
					<Button disabled={isLoading} form="add-committee-resolution" type="submit">
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
