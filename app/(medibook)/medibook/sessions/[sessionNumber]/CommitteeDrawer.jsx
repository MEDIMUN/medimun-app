"use client";
import { Button, ButtonGroup } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addCommittee } from "./add-committee.server";
import { Textarea } from "@nextui-org/react";
import { RadioGroup, Radio } from "@nextui-org/react";
export default function Drawer({ props }) {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/medibook/signout");

	const [slug, setSlug] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function addCommitteeReceiver(data) {
		const res = await addCommittee(data);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res?.ok) {
			setSlug("");
			router.push(`/medibook/sessions/${props.sessionNumber}`);
			router.refresh();
		}
	}

	useEffect(() => {
		setIsOpen(searchParams.get("add") == "committee" && status === "authenticated" && authorize(session, [s.management]));
	}, [searchParams, status, session]);

	return (
		<Sheet open={isOpen} onOpenChange={() => router.push(`/medibook/sessions/${props.sessionNumber}`)}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Add Committee to Session</SheetTitle>
				</SheetHeader>
				<form action={addCommitteeReceiver} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
					<input required type="hidden" value={props.sessionNumber} min={1} name="sessionNumber" className="col-span-3" />
					<Input label="Committee Name" labelPlacement="outside" isRequired placeholder="e.g. General Assembly 1" name="name" />
					<Textarea label="Description" labelPlacement="outside" name="description" maxLength={200} minLength={10} />
					<Input label="Short Name" labelPlacement="outside" placeholder="e.g. GA1" name="shortName" />
					<Input label="Topic 1" labelPlacement="outside" placeholder="e.g. The question of illicit firearms trade in undermining..." name="topic1" />
					<Input label="Topic 2" labelPlacement="outside" placeholder="e.g. The question of regulating rising cyber warfare..." name="topic2" />
					<Input label="Topic 3" labelPlacement="outside" placeholder="e.g. The question of the threat of Artificial Intelligence.." name="topic3" />
					<Input
						labelPlacement="outside"
						label="Link Slug"
						placeholder="e.g. general-assembly-1"
						value={slug}
						onChange={(e) =>
							setSlug(
								e.target.value
									.replace(" ", "-")
									.replace(/[^a-zA-Z-]/g, "")
									.toLowerCase()
									.replace(/-+/g, "-")
									.replace(/^-/, "")
									.trim()
									.slice(0, 32)
							)
						}
						name="slug"
						maxLength={30}
						minLength={2}
					/>
					<RadioGroup size="sm" label="Committee Type" name="committeeType" isRequired>
						<Radio value="GENERALASSEMBLY">General Assembly</Radio>
						<Radio value="SECURITYCOUNCIL">Security Council</Radio>
						<Radio value="SPECIALCOMMITTEE">Special Committee</Radio>
					</RadioGroup>
				</form>
				<SheetFooter>
					<Button form="main" color="primary" type="submit">
						Save
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
