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
import { addDay } from "./add-day.server";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Drawer(props) {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/medibook/signout");

	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function addDayWrapper(data) {
		const res = await addDay(data);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
	}

	useEffect(() => {
		setIsOpen(searchParams.get("add") == "" && status === "authenticated" && authorize(session, [s.admins, s.sd]));
	}, [searchParams, status, session]);

	return (
		<Sheet open={isOpen} onOpenChange={() => router.push(`/medibook/sessions/${props.selectedSession}/days`)}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Add Conference or Workshop Day</SheetTitle>
				</SheetHeader>
				<SheetDescription>If the conference will be taking place over multiple days, you need to add each day separately.</SheetDescription>
				<form action={addDayWrapper} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
					<Input required type="hidden" min={1} defaultValue={props.selectedSession} id="sessionNumber" name="sessionNumber" className="col-span-3" />
					<Label htmlFor="name">Day Type (Required)</Label>
					<RadioGroup name="type" defaultValue="workshop">
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="workshop" id="workshop" />
							<Label htmlFor="workshop">Workshop Day</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="conference" id="conference" />
							<Label htmlFor="conference">Conference Day</Label>
						</div>
					</RadioGroup>
					<Label htmlFor="date" required>
						Date (Required)
					</Label>
					<Input required type="date" id="date" name="date" />
					<Label htmlFor="name">Name (Optional)</Label>
					<Input maxLength={32} id="name" name="name" className="col-span-3" />
					<Label htmlFor="description">Description (Optional)</Label>
					<Input maxLength={32} id="description" name="description" className="col-span-3" />
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
