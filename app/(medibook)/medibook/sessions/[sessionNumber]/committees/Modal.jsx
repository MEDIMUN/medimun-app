"use client";
import { Label } from "@/components/ui/label";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addCommittee, deleteCommittee } from "./add-committee.server";
import { Textarea } from "@nextui-org/react";
import { RadioGroup, Radio } from "@nextui-org/react";
import { Modal, ModalContent, AvatarGroup, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Input, Button, ButtonGroup } from "@nextui-org/react";
import { removeSearchParams } from "@/lib/searchParams";

export default function Drawer({ edit, sessionNumber }) {
	const { data: session, status } = useSession();

	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	const [slug, setSlug] = useState(edit?.slug || null);

	async function addCommitteeHandler(formData) {
		formData.append("sessionNumber", sessionNumber);
		formData.append("committeeId", searchParams.get("edit"));
		const res = await addCommittee(formData);
		if (res) toast(res);
		if (res?.ok) {
			removeSearchParams(router, { add: "", edit: "", delete: "" });
			router.refresh();
		}
	}

	function handleSlugChange(e) {
		setSlug(
			e.target.value
				.replace(" ", "-")
				.replace(/[^a-zA-Z0-9-]/g, "")
				.toLowerCase()
				.replace(/-+/g, "-")
				.replace(/^-/, "")
				.trim()
				.slice(0, 32)
		);
	}

	function onSlugBlur(e) {
		if (slug.endsWith("-")) {
			setSlug(slug.slice(0, -1));
		}
	}

	useEffect(() => {
		if (edit?.slug) setSlug(edit.slug);
		if (!edit?.slug) setSlug("");
	}, [edit, searchParams]);

	return (
		<Modal isOpen={(searchParams.has("add") || searchParams.has("edit")) && status === "authenticated" && authorize(session, [s.management])} onOpenChange={() => removeSearchParams(router, { add: "", edit: "" })}>
			<ModalContent className="overflow-y-auto" position="right" size="content">
				<ModalHeader>Add Committee to Session {sessionNumber}</ModalHeader>
				<ModalBody>
					<form action={addCommitteeHandler} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
						<Input defaultValue={edit?.name} size="lg" label="Committee Name" isRequired name="name" />
						<Input defaultValue={edit?.shortName} size="lg" label="Short Name" name="shortName" />
						<Select defaultSelectedKeys={[edit?.type]} isRequired size="lg" label="Committee Type" name="committeeType">
							<SelectItem key="GENERALASSEMBLY">General Assembly</SelectItem>
							<SelectItem key="SECURITYCOUNCIL">Security Council</SelectItem>
							<SelectItem key="SPECIALCOMMITTEE">Special Committee</SelectItem>
						</Select>
						<Input defaultValue={edit?.slug} label="Link Slug" size="lg" value={slug} onChange={handleSlugChange} onBlur={onSlugBlur} name="slug" maxLength={30} minLength={2} />
						<Input defaultValue={edit?.topic1} size="lg" label="Topic 1" name="topic1" />
						<Input defaultValue={edit?.topic2} size="lg" label="Topic 2" name="topic2" />
						<Input defaultValue={edit?.topic3} size="lg" label="Topic 3" name="topic3" />
						<Textarea defaultValue={edit?.description} size="lg" label="Description" name="description" maxLength={200} minLength={10} />
					</form>
				</ModalBody>
				<ModalFooter>
					<Button form="main" type="submit">
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export function DeleteModal() {
	const { data: session, status } = useSession();

	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	async function deleteCommitteeHandler() {
		const committeeId = searchParams.get("delete");
		const res = await deleteCommittee(committeeId);
		if (res) toast(res);
		if (res.ok) {
			removeSearchParams(router, { add: "", edit: "", delete: "" });
			router.refresh();
		}
	}

	return (
		<Modal isOpen={searchParams.has("delete") && status === "authenticated" && authorize(session, [s.management])} onOpenChange={() => removeSearchParams(router, { add: "", edit: "", delete: "" })}>
			<ModalContent>
				<ModalHeader>Delete Committee</ModalHeader>
				<ModalBody>Are you sure you want to delete the committee? This action is irreversible.</ModalBody>
				<ModalFooter>
					<Button color="danger" onPress={deleteCommitteeHandler}>
						Delete
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
