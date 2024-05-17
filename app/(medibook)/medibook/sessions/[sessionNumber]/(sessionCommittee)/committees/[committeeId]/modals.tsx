"use client";
import { Input, Textarea, Button, RadioGroup, Radio } from "@nextui-org/react";
import { Label } from "@/components/ui/label";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { editCommittee } from "./actions";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Select, SelectSection, SelectItem } from "@nextui-org/react";
import { removeSearchParams } from "@/lib/searchParams";
import { SlugInput } from "@/components/slugInput";
import { drawerProps } from "@/constants";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditModal({ selectedCommittee }) {
	const { data: session, status } = useSession();

	const router = useRouter();

	const searchParams = useSearchParams();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			name: selectedCommittee?.name,
			shortName: selectedCommittee?.shortName,
			slug: selectedCommittee?.slug,
			topic1: selectedCommittee?.topic1,
			topic2: selectedCommittee?.topic2,
			topic3: selectedCommittee?.topic3,
			description: selectedCommittee?.description,
			committeeType: selectedCommittee?.type,
		},
	});

	function r(params: any) {
		const registeredValue = register(params);
		return { ...registeredValue, size: "lg" };
	}

	async function editCommitteeWrapper(data) {
		data.append("committeeId", selectedCommittee.id);
		const res = await editCommittee(data);
		if (res) toast(res?.title);
		if (res?.ok) {
			removeSearchParams({ edit: "" }, router);
			router.refresh();
		}
	}

	return (
		<Modal {...drawerProps} isOpen={searchParams.has("edit") && status === "authenticated" && authorize(session, [s.management])} onOpenChange={() => removeSearchParams({ edit: "" }, router)}>
			<ModalContent>
				<ModalHeader>Edit {selectedCommittee?.name}</ModalHeader>
				<ModalBody as="form" action={editCommitteeWrapper} id="main">
					<Input {...r("name")} label="Committee Name" isRequired placeholder="e.g. General Assembly 1" />
					<Input {...r("shortName")} label="Short Name" placeholder="e.g. GA1" />
					<SlugInput {...r("slug")} label="Link Slug" placeholder="e.g. general-assembly-1" />
					<Select {...r("committeeType")} label="Committee Type" isRequired defaultSelectedKeys={[selectedCommittee?.type]}>
						<SelectItem key="GENERALASSEMBLY">General Assembly</SelectItem>
						<SelectItem key="SECURITYCOUNCIL">Security Council</SelectItem>
						<SelectItem key="SPECIALCOMMITTEE">Special Committee</SelectItem>
					</Select>
					<Textarea {...r("topic1")} label="Topic 1" placeholder="e.g. The question of illicit firearms trade in undermining peace efforts" />
					<Textarea {...r("topic2")} label="Topic 2" placeholder="e.g. The question of regulating rising cyber warfare" />
					<Textarea {...r("topic3")} label="Topic 3" placeholder="e.g. The question of the threat of Artificial Intelligence influencing the proliferation of nuclear weapo" />
					<Textarea {...r("description", { maxLength: 100 })} label="Description" />
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
