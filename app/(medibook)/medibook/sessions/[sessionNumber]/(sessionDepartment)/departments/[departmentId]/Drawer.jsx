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

export default function Drawer({ committee, params }) {
	const { data: session, status } = useSession();

	const [slug, setSlug] = useState(committee.slug);
	const [isOpen, setIsOpen] = useState(false);
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

	useEffect(() => {
		setIsOpen(searchParams.get("edit") == "" && status === "authenticated" && authorize(session, [s.management]));
	}, [searchParams, status, session]);

	return (
		<Sheet open={isOpen} onOpenChange={() => router.push(searchParams.get("saveurl") || `/medibook/sessions/${committee.session.number}/committees/${committee.slug || committee.id}`)}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Edit {committee.name}</SheetTitle>
				</SheetHeader>
				<form action={editCommitteeWrapper} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
					<Input label="Committee Name" labelPlacement="outside" defaultValue={committee.name} isRequired placeholder="e.g. General Assembly 1" name="name" />
					<Input label="Short Name" labelPlacement="outside" defaultValue={committee.shortName} placeholder="e.g. GA1" name="shortName" />
					<Input
						label="Link Slug"
						labelPlacement="outside"
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
					<Input label="Topic 1" labelPlacement="outside" defaultValue={committee.topic1} placeholder="e.g. The question of illicit firearms trade in undermining peace efforts" name="topic1" />
					<Input label="Topic 2" labelPlacement="outside" defaultValue={committee.topic2} placeholder="e.g. The question of regulating rising cyber warfare" name="topic2" />
					<Input label="Topic 3" labelPlacement="outside" defaultValue={committee.topic3} placeholder="e.g. The question of the threat of Artificial Intelligence influencing the proliferation of nuclear weapo" name="topic3" />
					<Textarea label="Description" labelPlacement="outside" defaultValue={committee.description} name="description" maxLength={1000} minLength={10} />
					<RadioGroup size="sm" label="Committee Type" isRequired required name="committeeType" defaultValue={committee.type}>
						<Radio value="GENERALASSEMBLY">General Assembly</Radio>
						<Radio value="SECURITYCOUNCIL">Security Council</Radio>
						<Radio value="SPECIALCOMMITTEE">Special Committee</Radio>
					</RadioGroup>
					<Button color="primary" className="ml-auto" type="submit">
						Save
					</Button>
				</form>
			</SheetContent>
		</Sheet>
	);
}
