"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addCommittee, deleteCommittee } from "./actions";
import { Textarea } from "@nextui-org/react";
import { Modal, ModalContent, AvatarGroup, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Input, Button, ButtonGroup } from "@nextui-org/react";
import { removeSearchParams } from "@/lib/searchParams";
import { SlugInput } from "@/components/slugInput";
import { drawerProps } from "@/constants";

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
			removeSearchParams({ add: "", edit: "", delete: "" }, router);
			router.refresh();
		}
	}

	return (
		<Modal {...drawerProps} isOpen={(searchParams.has("add") || searchParams.has("edit")) && status === "authenticated" && authorize(session, [s.management])} onOpenChange={() => removeSearchParams({ add: "", edit: "" }, router)}>
			<ModalContent>
				<ModalHeader>Add Committee to Session {sessionNumber}</ModalHeader>
				<ModalBody as="form" id="main" action={addCommitteeHandler}>
					<Input defaultValue={edit?.name} size="lg" label="Committee Name" isRequired name="name" />
					<Input defaultValue={edit?.shortName} size="lg" label="Short Name" name="shortName" />
					<Select defaultSelectedKeys={[edit?.type]} isRequired size="lg" label="Committee Type" name="committeeType">
						<SelectItem key="GENERALASSEMBLY">General Assembly</SelectItem>
						<SelectItem key="SECURITYCOUNCIL">Security Council</SelectItem>
						<SelectItem key="SPECIALCOMMITTEE">Special Committee</SelectItem>
					</Select>
					<SlugInput defaultValue={edit?.slug} label="Link Slug" name="slug" />
					<Textarea defaultValue={edit?.topic1} size="lg" label="Topic 1" name="topic1" />
					<Textarea defaultValue={edit?.topic2} size="lg" label="Topic 2" name="topic2" />
					<Textarea defaultValue={edit?.topic3} size="lg" label="Topic 3" name="topic3" />
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
