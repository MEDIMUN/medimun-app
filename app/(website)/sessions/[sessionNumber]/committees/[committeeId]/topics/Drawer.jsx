"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { editTopics } from "./edit-topics.server";
import { Textarea } from "@/components/ui/textarea";

export default function Drawer({ committee, params }) {
	const { data: session, status } = useSession();

	const [slug, setSlug] = useState(committee.slug);
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function editTopicsWrapper(data) {
		const res = await editTopics(data);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res?.ok) {
			setSlug("");
			router.push(`/medibook/sessions/${params.sessionNumber}/committees/${committee.id}/topics`);
			router.refresh();
		}
	}

	useEffect(() => {
		setIsOpen(searchParams.get("edit") == "" && status === "authenticated" && authorize(session, [s.management]));
	}, [searchParams, status, session]);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<Sheet open={isOpen} onOpenChange={() => router.push(`/medibook/sessions/${committee.session.number}/committees/${committee.slug || committee.id}/topics`)}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Edit {committee.name} Topics</SheetTitle>
				</SheetHeader>
				<form action={editTopicsWrapper} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
					<Input required type="hidden" value={committee.id} min={1} id="committeeId" name="committeeId" className="col-span-3" />
					<Label htmlFor="topic1">Topic 1</Label>
					<Input minLength={3} maxLength={100} defaultValue={committee.topic1} placeholder="Topic 1" id="topic1" name="topic1" className="col-span-3" />
					<Label htmlFor="topic1description">Topic 1 Description</Label>
					<Textarea minLength={3} maxLength={1000} defaultValue={committee.topic1description} id="topic1description" name="topic1description" className="col-span-3" />
					<Label htmlFor="topic2">Topic 2</Label>
					<Input minLength={3} maxLength={100} defaultValue={committee.topic2} placeholder="Topic 2" id="topic2" name="topic2" className="col-span-3" />
					<Label htmlFor="topic2description">Topic 2 Description</Label>
					<Textarea minLength={3} maxLength={1000} defaultValue={committee.topic2description} id="topic2description" name="topic2description" className="col-span-3" />
					<Label htmlFor="topic3">Topic 3</Label>
					<Input minLength={3} maxLength={100} defaultValue={committee.topic3} placeholder="Topic 3" id="topic3" name="topic3" className="col-span-3" />
					<Label htmlFor="topic3description">Topic 3 Description</Label>
					<Textarea minLength={3} maxLength={1000} defaultValue={committee.topic2description} id="topic3description" name="topic3description" className="col-span-3" />
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
