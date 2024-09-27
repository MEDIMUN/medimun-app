"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";
import { removeSearchParams } from "@/lib/searchParams";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createTopic, deleteTopic, editTopic } from "./actions";

export function CreateTopicModal({ selectedCommittee }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ "create-topic": "" }, router);
	}

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		const res = await createTopic(formData, selectedCommittee.id);
		if (res?.ok) {
			toast.success(...res?.message);
			router.refresh();
			onClose();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = !!searchParams.get("create-topic") && status === "authenticated" && authorize(authSession, [s.management]);
	if (!selectedCommittee) return null;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Create Topic in {selectedCommittee.name}</DialogTitle>
			<DialogBody id="create-topic" as="form" className="flex flex-col gap-6" action={handleSubmit}>
				<Field>
					<Label>
						Title <Badge color="red">Required</Badge>
					</Label>
					<Input required name="title" type="text" />
				</Field>
				<Field>
					<Label>Description</Label>
					<Description>Supports Markdown</Description>
					<Textarea name="description" />
				</Field>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" form="create-topic" disabled={isLoading}>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function EditTopicModal({ selectedTopic }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	const isManagement = authorize(authSession, [s.management]);
	const isChairOfCommittee =
		status === "authenticated" && !!selectedTopic && authorizeChairCommittee(authSession.currentRoles, selectedTopic.committee.id);

	function onClose() {
		removeSearchParams({ "edit-topic": "" }, router);
	}

	async function handleSubmit(formData: FormData) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await editTopic(formData, selectedTopic.id);
		if (res?.ok) {
			toast.success(...res?.message);
			router.refresh();
			onClose();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = !!searchParams.get("edit-topic") && status === "authenticated" && (isManagement || isChairOfCommittee);
	if (!selectedTopic) return null;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Edit Topic</DialogTitle>
			<DialogBody id="edit-topic" as="form" className="flex flex-col gap-6" action={handleSubmit}>
				{isManagement && (
					<Field>
						<Label>
							Title <Badge color="red">Required</Badge>
						</Label>
						<Input defaultValue={selectedTopic.title} required name="title" type="text" />
					</Field>
				)}
				<Field>
					<Label>Description</Label>
					<Description>Supports Markdown</Description>
					<Textarea defaultValue={selectedTopic.description} name="description" />
				</Field>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button loading={isLoading} type="submit" form="edit-topic" disabled={isLoading}>
					Update
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function DeleteTopicModal({ selectedTopic }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	function onClose() {
		removeSearchParams({ "delete-topic": "" }, router);
	}

	async function handleSubmit() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await deleteTopic(selectedTopic.id);
		if (res?.ok) {
			toast.success(...res?.message);
			router.refresh();
			onClose();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isOpen = !!searchParams.get("delete-topic") && status === "authenticated" && authorize(authSession, [s.management]);
	if (!selectedTopic) return null;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Delete Topic in {selectedTopic.committee.name}</DialogTitle>
			<DialogDescription>Are you sure you want to delete the topic {selectedTopic.title}?</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button loading={isLoading} color="red" onClick={handleSubmit} disabled={isLoading}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
