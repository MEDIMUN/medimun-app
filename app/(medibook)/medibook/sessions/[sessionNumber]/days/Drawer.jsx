"use client";

import { Input, Textarea, Button } from "@nextui-org/react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addDay } from "./add-day.server";
import { RadioGroup, Radio } from "@nextui-org/react";

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
				<form action={addDayWrapper} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
					<input required type="hidden" min={1} defaultValue={props.selectedSession} id="sessionNumber" name="sessionNumber" className="col-span-3" />
					<RadioGroup size="sm" label="Day Type" isRequired required name="type">
						<Radio value="workshop">Workshop Day</Radio>
						<Radio value="conference">Conference Day</Radio>
					</RadioGroup>
					<Input isRequired type="date" label="Date" labelPlacement="outside" placeholder=" " name="date" />
					<Input label="Name" placeholder=" " labelPlacement="outside" maxLength={32} name="name" />
					<Textarea maxLength={32} label="Description" name="description" labelPlacement="outside" />
					<Button form="main" className="ml-auto" color="primary" type="submit">
						Save
					</Button>
				</form>
			</SheetContent>
		</Sheet>
	);
}
