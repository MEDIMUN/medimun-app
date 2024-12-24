"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Divider } from "@/components/divider";
import { Description, Field, Fieldset, Label, Legend } from "@/components/fieldset";
import { Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import Paginator from "@/components/pagination";
import { Select } from "@/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { useFlushState } from "@/hooks/use-flush-state";
import { authorize, authorizeChairCommittee, authorizeManagerDepartment, s } from "@/lib/authorize";
import { cn } from "@/lib/cn";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import mimeExt from "mime-ext";
import { SearchParamsButton } from "@/app/(medibook)/medibook/client-components";
import { Text, TextLink } from "@/components/text";
import { createPositionPaper, deletePositionPaper, returnPositionPaper } from "./action";
import { Radio, RadioField, RadioGroup } from "@/components/radio";
import { Textarea } from "@/components/textarea";

export function ModalSubmitPositionPaper({ allResources, totalResources, selectedCommittee }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useFlushState(false);
	const [selectedPositionPaper, setSelectedPositionPaper] = useState(null);
	const isManagement = authorize(authSession, [s.management]);

	function onClose() {
		removeSearchParams({ "submit-position-paper": "" }, router);
	}

	async function handleSubmit() {
		setIsLoading(true);
		if (isLoading || !selectedPositionPaper) return;
		const res = await createPositionPaper(selectedPositionPaper, selectedCommittee.id);
		if (res?.ok) {
			toast.success(res?.message || ["Position paper submitted successfully"]);
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message || ["An error occurred"]);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.get("submit-position-paper") && status === "authenticated";

	return (
		<Dialog open={!!isOpen} onClose={onClose}>
			<DialogTitle>Submit Position Paper</DialogTitle>
			<DialogDescription>Please select one of the resources to submit as your resource paper.</DialogDescription>
			<DialogBody className="gap-5 flex flex-col">
				{!!allResources.length && (
					<Table className="showscrollbar">
						<TableHead>
							<TableRow>
								<TableHeader>
									<span className="sr-only">Select</span>
								</TableHeader>
								<TableHeader>Name</TableHeader>
								<TableHeader>External URL</TableHeader>
								<TableHeader>File Type</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{allResources.map((resource) => (
								<TableRow key={resource.id}>
									<TableCell>
										<Checkbox
											checked={selectedPositionPaper === resource.id}
											onChange={(val) => {
												setSelectedPositionPaper(val ? resource.id : null);
											}}
											disabled={isLoading || (selectedPositionPaper !== resource.id && selectedPositionPaper !== null)}
										/>
									</TableCell>
									<TableCell>{resource.name || "-"}</TableCell>
									<TableCell>
										{resource.driveUrl ? (
											<TextLink target="_blank" href={`https://${resource.driveUrl}`}>
												{resource.driveUrl}
											</TextLink>
										) : (
											"-"
										)}
									</TableCell>
									<TableCell>{resource.mimeType ? `.${mimeExt(resource.mimeType)[0]}` : "-"}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
				<Paginator itemsOnPage={allResources.length} totalItems={totalResources} />
				<div className="flex">
					<Divider className="my-auto w-[40%]" />
					<p className="w-[20%] text-center text-xs">OR</p>
					<Divider className="my-auto w-[45%]" />
				</div>
				<SearchParamsButton className="w-full" searchParams={{ uploadresource: "true" }}>
					Upload New File
				</SearchParamsButton>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} disabled={isLoading || !selectedPositionPaper} loading={isLoading} form="uploadResource" type="submit">
					Submit
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function ModalReturnPositionPaper({ selectedPositionPaper }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useFlushState(false);
	const isManagement = status === "authenticated" && authorize(authSession, [s.management]);

	function onClose() {
		removeSearchParams({ "return-position-paper": "" }, router);
	}

	async function handleSubmit(formData: FormData) {
		if (!formData) return;
		if (isLoading || !selectedPositionPaper) return;
		setIsLoading(true);
		const res = await returnPositionPaper(formData, selectedPositionPaper.id);
		if (res?.ok) {
			toast.success(res?.message || ["Position paper submitted successfully"]);
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message || ["An error occurred"]);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.get("return-position-paper") && status === "authenticated" && selectedPositionPaper;

	return (
		<Dialog open={!!isOpen} onClose={onClose}>
			<DialogTitle>Return Position Paper</DialogTitle>
			<DialogBody as="form" action={handleSubmit} id="return-position-paper" className="gap-5 flex flex-col">
				<Fieldset>
					<Legend>Return Action</Legend>
					<RadioGroup name="action" defaultValue="APPROVED">
						<RadioField>
							<Radio value="APPROVED" />
							<Label>Accept</Label>
							<Description>
								The Position Paper will be accepted and saved as the final version. The delegate will not be able to make any further submissions or
								changes. If you accidentally accept a submission, please delete the position paper and ask the delegate to resubmit.
								<br />
								<i>The delegate will be able to view your comments if you provide any.</i>
							</Description>
						</RadioField>
						<RadioField>
							<Radio value="REVISION" />
							<Label>Return for Revision</Label>
							<Description>
								The Position Paper will be returned to the delegate for further revisions. The delegate will be able to make a new submission if the
								submissions are still open.
								<br />
								<i>The delegate will be able to view your comments if you provide any.</i>
							</Description>
						</RadioField>
						<RadioField>
							<Radio value="REJECTED" />
							<Label>Reject</Label>
							<Description>
								The Position Paper will be rejected and the delegate will <b>not</b> be able to make any further submissions or changes. If you
								accidentally reject a submission, please delete the position paper and ask the delegate to resubmit.
								<br />
								<i>The delegate will be able to view your comments if you provide any.</i>
							</Description>
						</RadioField>
					</RadioGroup>
				</Fieldset>
				<Textarea className=" " name="comment" placeholder="Add a comment..." maxLength={10000} />
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button form="return-position-paper" disabled={isLoading} loading={isLoading} type="submit">
					Return
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function ModalDeletePositionPaper({ selectedPositionPaper }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useFlushState(false);

	function onClose() {
		removeSearchParams({ "delete-position-paper": "" }, router);
	}

	async function handleSubmit() {
		if (isLoading || !selectedPositionPaper) return;
		setIsLoading(true);
		const res = await deletePositionPaper(selectedPositionPaper.id);
		if (res?.ok) {
			toast.success(res?.message || ["Position paper deleted successfully"]);
			onClose();
			router.push(
				`/medibook/sessions/${selectedPositionPaper.committee.session.number}/committees/${selectedPositionPaper.committee.slug || selectedPositionPaper.committeeId}/position-papers`
			);
		} else {
			toast.error(res?.message || ["An error occurred"]);
		}
		setIsLoading(false);
	}

	const isOpen = searchParams && searchParams.get("delete-position-paper") && status === "authenticated" && selectedPositionPaper;

	return (
		<Dialog open={!!isOpen} onClose={onClose}>
			<DialogTitle>Delete Position Paper</DialogTitle>
			<DialogDescription>Are you sure you want to delete the position paper?</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button color="red" onClick={handleSubmit} disabled={isLoading} loading={isLoading}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
