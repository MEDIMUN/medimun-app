"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
	SelectLabel,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";
import { useDebouncedState } from "@mantine/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "./create-announcement.server";
import { useToast } from "@/components/ui/use-toast";
import { Scope, authorize } from "@/src/lib/authorize";
import { useSession } from "next-auth/react";
import { useDebouncedValue } from "@mantine/hooks";
import markdownExample from "@/src/defaults/markdown";

export default function SearchBar() {
	const searchParams = useSearchParams();
	const search = searchParams.get("action");
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();
	const { data: session, status } = useSession();
	const [markdown, setMarkdown] = useState(markdownExample);
	const [debounced] = useDebouncedValue(markdown, 1000);

	useEffect(() => {
		search == "create" ? setOpen(true) : setOpen(false);
		console.log(markdownExample);
	}, [searchParams]);

	const handleSubmit = async () =>
		startTransition(async () => {
			const res = await createAnnouncement(new FormData(main));
			if (res == "success") {
				toast({ title: "Announcement Created" });
			}
			if (res == "error") {
				toast({ title: "Something went wrong", description: res.error, variant: "destructive" });
			}
			if (res == "invalid") {
				toast({ title: "Something went wrong", description: res.error, variant: "destructive" });
			}
		});

	let [isPending, startTransition] = useTransition();

	return (
		<Sheet
			onOpenChange={() => {
				router.push("/medibook/announcements");
			}}
			open={open}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Create Announcement</SheetTitle>
					<SheetDescription>
						Only Global Announcements can be added here, to add an announcement to
						<br /> a session, committee, or department please go to the respected session.
					</SheetDescription>
				</SheetHeader>
				<form
					action={createAnnouncement}
					id="main"
					className="flex col items-center flex-col gap-y-4 my-4">
					<div className="w-full grid gap-2">
						<Label htmlFor="title" className="text-right mr-auto">
							Title
						</Label>
						<Input required maxLength={128} name="title" className="w-[100%]"></Input>
					</div>
					<div className="w-full grid gap-2">
						<Label htmlFor="description" className="text-right mr-auto">
							Description
						</Label>
						<Input maxLength={256} name="description" className="w-[100%]" />
					</div>
					<div className="w-full grid gap-2">
						<Label htmlFor="scope" className="text-right mr-auto">
							Announcement Scope
						</Label>
						<Select defaultValue="2" required name="scope">
							<SelectTrigger value="@peduarte" className="col-span-3 min-h-[50px]">
								<SelectValue placeholder="Select a scope" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">Global</SelectItem>
								<SelectItem value="2">Registered</SelectItem>
								<SelectItem value="3">Enrolled</SelectItem>
								<SelectItem value="4">Current Session</SelectItem>
								<SelectItem value="5">Alumni</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Label className="my-auto mr-auto">Publishing Options</Label>
					<div className="w-[100%] flex flex-col p-2 gap-3 border-[1px] border-200 rounded-md">
						<div className="w-full flex gap-2 row">
							<Switch defaultChecked name="isMedibook" />
							<Label className="my-auto" htmlFor="isMedibook">
								Show in MediBook Feed
							</Label>
						</div>
						<div className="w-full flex gap-2 row">
							<Switch defaultChecked name="isWebsite" />
							<Label className="my-auto" htmlFor="isWebsite">
								Show in Website Feed
							</Label>
						</div>
						{status == "authenticated" &&
							authorize(session, [Scope.Admins, Scope.Board, Scope["Higher Secretariat"]]) && (
								<div className="w-full flex gap-2 row">
									<Switch name="isEmail" />
									<Label className="my-auto" htmlFor="isEmail">
										Send as Email <strong className="text-red-500">Non Reverasable Action</strong>
									</Label>
								</div>
							)}
					</div>
					<Label className="my-auto mr-auto">Visibility Options</Label>
					<div className="w-[100%] flex flex-col p-2 gap-3 border-[1px] border-200 rounded-md">
						<div className="w-full flex gap-2 row">
							<Switch name="isAnonymous" />
							<Label className="my-auto" htmlFor="isAnonymous">
								Send as Anonymous
							</Label>
						</div>
						{status == "authenticated" && authorize(session, [Scope.Secretariat]) && (
							<div className="w-full flex gap-2 row">
								<Switch name="isSecretariat" />
								<Label className="my-auto" htmlFor="isSecretariat">
									Send as Secretariat
								</Label>
							</div>
						)}
						{status == "authenticated" && authorize(session, [Scope.Board, Scope.Admins]) && (
							<div className="w-full flex gap-2 row">
								<Switch name="isBoard" />
								<Label className="my-auto" htmlFor="isBoard">
									Send as Board
								</Label>
							</div>
						)}
					</div>
					<div className="w-full grid gap-2">
						<Label htmlFor="email" className="text-right mr-auto">
							Email Distribution
						</Label>
						<Select defaultValue="false" name="email">
							<SelectTrigger value="email" className="col-span-3 min-h-[50px]">
								<SelectValue placeholder="Select a scope" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="true">Everyone in Selected Scope</SelectItem>
									<SelectItem value="consent">
										Everyone in Selected Scope who has joined the mailing list
									</SelectItem>
									<SelectItem value="false">No One</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<Tabs defaultValue="content" className="w-full">
						<TabsList className="w-[100%]">
							<TabsTrigger className="w-[50%]" value="content">
								Content (MarkDown)
							</TabsTrigger>
							<TabsTrigger className="w-[50%]" value="preview">
								Preview Content
							</TabsTrigger>
						</TabsList>
						<TabsContent value="content">
							<div className="w-full grid gap-2">
								<Link
									className="font-light ml-2"
									href="https://youtu.be/4z0l5Kl2Q6E"
									target="_blank">
									Learn more about <strong className="text-blue-500">markdown</strong>.
								</Link>
								<Textarea
									onChange={() => setMarkdown(event.target.value)}
									name="markdown"
									className="col-span-3 min-h-[300px]"
									value={markdown}
								/>
							</div>
						</TabsContent>
						<TabsContent value="preview">
							<div className="w-[100%] grid gap-2">
								<Link
									className="font-light ml-2"
									href="https://youtu.be/4z0l5Kl2Q6E"
									target="_blank">
									Learn more about <strong className="text-blue-500">markdown</strong>.
								</Link>
								<ReactMarkdown className="h-auto border-[1px] border-gray-200 rounded-md p-3 w-[100%] min-h-[300px]">
									{debounced}
								</ReactMarkdown>
							</div>
						</TabsContent>
					</Tabs>
				</form>
				<SheetFooter>
					<Button
						onClick={handleSubmit}
						disabled={isPending}
						form="main"
						className="flex w-auto mt-4"
						type="submit">
						{isPending ? "Loading" : "Publish"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
