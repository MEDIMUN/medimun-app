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
import { createSession } from "./create-session.server";

export default function Drawer() {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/medibook/signout");

	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function createSessionReceiver(data) {
		const res = await createSession(data);
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
		<Sheet open={isOpen} onOpenChange={() => router.push("/medibook/sessions")}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Create a Session</SheetTitle>
					<SheetDescription>Sessions are not set as "current" by default. You can set them as "current" by editing the session.</SheetDescription>
				</SheetHeader>
				<form action={createSessionReceiver} id="main" name="main" className="grid gap-4 py-4">
					<Label htmlFor="sessionNumber">Session Number (Required)</Label>
					<Input required type="number" min={1} id="sessionNumber" name="sessionNumber" className="col-span-3" />
					<Label htmlFor="theme">Theme (Optional)</Label>
					<Input id="theme" name="theme" className="col-span-3" />
					<Label htmlFor="phrase2">Theme Secondary Phrase (Optional)</Label>
					<Input id="phrase2" name="phrase2" className="col-span-3" />
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
