"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addCommittee } from "./add-committee.server";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
			router.push(`/medibook/sessions/${props.sessionNumber}/committees#`);
			router.refresh();
		}
	}

	useEffect(() => {
		setIsOpen(searchParams.get("add") == "" && status === "authenticated" && authorize(session, [s.admins, s.sd, s.sec]));
	}, [searchParams, status, session]);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<Sheet open={isOpen} onOpenChange={() => router.push(`/medibook/sessions/${props.sessionNumber}/committees`)}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Add Committee to Session</SheetTitle>
					<SheetDescription>You can edit the committee to assign delegates, chairs or add themes</SheetDescription>
				</SheetHeader>
				<form action={addCommitteeReceiver} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
					<Input required type="hidden" value={props.sessionNumber} min={1} id="sessionNumber" name="sessionNumber" className="col-span-3" />
					<Label htmlFor="name">Committee Name (Required)</Label>
					<Input required placeholder="General Assembly 1" id="name" name="name" className="col-span-3" />
					<Label htmlFor="description">Committee Description</Label>
					<Textarea placeholder="" id="description" name="description" className="col-span-3" maxLength={200} minLength={10} />
					<Label htmlFor="shortName">Short Name</Label>
					<Input placeholder="GA1" id="shortName" name="shortName" className="col-span-3" />
					<Label>Topics</Label>
					<div>
						<Label className="sr-only" htmlFor="topic1">
							Topic 1
						</Label>
						<Input placeholder="Topic 1" id="topic1" name="topic1" className="col-span-3 rounded-b-none" />
						<Label className="sr-only" htmlFor="topic2">
							Topic 2
						</Label>
						<Input placeholder="Topic 2" id="topic2" name="topic2" className="col-span-3 rounded-none border-y-0" />
						<Label className="sr-only" htmlFor="topic3">
							Topic 3
						</Label>
						<Input placeholder="Topic 3" id="topic3" name="topic3" className="col-span-3 rounded-t-none" />
					</div>
					<Label htmlFor="slug">Link Slug</Label>
					<Input
						placeholder="general-assembly-1"
						value={slug}
						onChange={(e) => setSlug(e.target.value.replace(" ", "").trim().toLowerCase())}
						id="slug"
						name="slug"
						maxLength={30}
						minLength={2}
						className="col-span-3"
					/>
					<Label htmlFor="committeeType">Committee Type</Label>
					<RadioGroup name="committeeType" required defaultValue="GENERALASSEMBLY">
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="GENERALASSEMBLY" id="GENERALASSEMBLY" />
							<Label htmlFor="GENERALASSEMBLY">General Assembly</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="SECURITYCOUNCIL" id="SECURITYCOUNCIL" />
							<Label htmlFor="SECURITYCOUNCIL">Security Council</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="SPECIALCOMMITTEE" id="SPECIALCOMMITTEE" />
							<Label htmlFor="SPECIALCOMMITTEE">Sales</Label>
						</div>
					</RadioGroup>
				</form>
				<SheetFooter>
					<Button form="main" className="mt-4 flex w-auto" type="submit">
						Save
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
