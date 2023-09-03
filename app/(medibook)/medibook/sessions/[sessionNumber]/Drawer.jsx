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
import { editSession } from "./edit-session.server";
import { currentSession } from "./current-session.server";

export default function Drawer(props) {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/medibook/signout");

	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function editSessionReceiver(data) {
		const res = await editSession(data);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
	}

	async function currentSessionReceiver(data) {
		const res = await currentSession(data);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
	}

	useEffect(() => {
		setIsOpen(searchParams.get("edit") == "" && status === "authenticated" && authorize(session, [s.admins, s.sd, s.sec]));
	}, [searchParams, status, session]);

	return (
		<Sheet open={isOpen} onOpenChange={() => router.push(`/medibook/sessions/${props.selectedSession.number}`)}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Edit Session {props.selectedSession.number}</SheetTitle>
					<SheetDescription>
						You can't change a session's Number. Only Senior Directors and Administrators can set the current session. If a session is set to "current" set another session as
						"current" to make it inactive.
					</SheetDescription>
				</SheetHeader>
				<form action={editSessionReceiver} id="main" name="main" className="grid gap-4 pb-2 pt-4">
					<Input required type="hidden" min={1} defaultValue={props.selectedSession.number} id="sessionNumber" name="sessionNumber" className="col-span-3" />
					<Label htmlFor="theme">Theme (Required)</Label>
					<Input required defaultValue={props.selectedSession.theme} id="theme" name="theme" className="col-span-3" />
					<Label htmlFor="phrase2">Theme Secondary Phrase (Required)</Label>
					<Input required defaultValue={props.selectedSession.phrase2} id="phrase2" name="phrase2" className="col-span-3" />
				</form>
				{status === "authenticated" && authorize(session, [s.admins, s.sd]) && !props.selectedSession.isCurrent && (
					<form action={currentSessionReceiver} className="border-gray-200 pt-2">
						<Input required type="hidden" min={1} defaultValue={props.selectedSession.number} id="sessionNumber" name="sessionNumber" className="col-span-3" />
						<Label htmlFor="isCurrentSession">Set as Current Session</Label>
						<SheetDescription>Changing this setting will effect the entire website and app and may have unreversable effects.</SheetDescription>
						<div className="my-2 grid gap-2 rounded-md border-[1px] bg-red-500 p-2">
							<Label className="sr-only" htmlFor="password">
								Password
							</Label>
							<Input
								required
								className="text-lg md:text-sm"
								id="password"
								name="password"
								placeholder="Password"
								type="password"
								autoCapitalize="none"
								autoComplete="password"
								autoCorrect="off"
							/>
							<Button id="isCurrentSession" name="isCurrentSession" className="border-[1px] border-white" htmlFor="isCurrentSession" variant="destructive">
								Set as Current Session
							</Button>
						</div>
					</form>
				)}
				<SheetFooter>
					<Button form="main" className="mt-4 flex w-auto" type="submit">
						Save
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
