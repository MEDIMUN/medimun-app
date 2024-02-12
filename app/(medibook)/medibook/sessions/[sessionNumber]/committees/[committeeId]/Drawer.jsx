"use client";
import { Input, Textarea, Button, RadioGroup, Radio } from "@nextui-org/react";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { editCommittee } from "./edit-committee.server";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Select, SelectSection, SelectItem } from "@nextui-org/react";

export default function Drawer({ committee, params }) {
	const { data: session, status } = useSession();

	const [slug, setSlug] = useState(committee.slug);
	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function editCommitteeWrapper(data) {
		data.append("committeeId", committee.id);
		const res = await editCommittee(data);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res?.ok) {
			setSlug("");
			router.push(searchParams.get("saveurl") || `/medibook/sessions/${params.sessionNumber}/committees/${committee.id}`);
			router.refresh();
		}
	}

	return (
		<Modal disableAnimation isOpen={searchParams.get("edit") == "" && status === "authenticated" && authorize(session, [s.management])} onOpenChange={() => router.push(searchParams.get("saveurl") || `/medibook/sessions/${committee.session.number}/committees/${committee.slug || committee.id}`)}>
			<ModalContent className="overflow-y-auto" position="right" size="content">
				<ModalHeader>Edit {committee.name}</ModalHeader>
				<ModalBody>
					<form action={editCommitteeWrapper} id="main" name="main" className="grid gap-2">
						<Input size="lg" label="Committee Name" defaultValue={committee.name} isRequired placeholder="e.g. General Assembly 1" name="name" />
						<Input size="lg" label="Short Name" defaultValue={committee.shortName} placeholder="e.g. GA1" name="shortName" />
						<Input
							size="lg"
							label="Link Slug"
							placeholder="e.g. general-assembly-1"
							value={slug}
							onChange={(e) =>
								setSlug(
									e.target.value
										.replace(" ", "-")
										.replace(/[^a-zA-Z1-9-]/g, "")
										.toLowerCase()
										.replace(/-+/g, "-")
										.replace(/^-/, "")
										.trim()
										.slice(0, 32)
								)
							}
							name="slug"
							minLength={2}
						/>
						<Input label="Topic 1" size="lg" defaultValue={committee.topic1} placeholder="e.g. The question of illicit firearms trade in undermining peace efforts" name="topic1" />
						<Input label="Topic 2" size="lg" defaultValue={committee.topic2} placeholder="e.g. The question of regulating rising cyber warfare" name="topic2" />
						<Input label="Topic 3" size="lg" defaultValue={committee.topic3} placeholder="e.g. The question of the threat of Artificial Intelligence influencing the proliferation of nuclear weapo" name="topic3" />
						<Textarea size="lg" label="Description" defaultValue={committee.description} name="description" maxLength={1000} minLength={10} />
						<Select label="Committee Type" size="lg" name="committeeType" isRequired defaultSelectedKeys={[committee.type]}>
							<SelectItem key="GENERALASSEMBLY">General Assembly</SelectItem>
							<SelectItem key="SECURITYCOUNCIL">Security Council</SelectItem>
							<SelectItem key="SPECIALCOMMITTEE">Special Committee</SelectItem>
						</Select>
					</form>
				</ModalBody>
				<ModalFooter>
					<Button form="main" color="primary" className="ml-auto" type="submit">
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
