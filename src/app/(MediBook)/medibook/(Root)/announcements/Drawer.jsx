"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
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
import { s, authorize } from "@/src/lib/authorize";
import { useSession } from "next-auth/react";
import { useDebouncedValue } from "@mantine/hooks";
import markdownExample from "@/src/defaults/markdown";

export default function SearchBar() {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/signout");

	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();
	const search = searchParams.get("action");

	const [open, setOpen] = useState(false);
	const [markdown, setMarkdown] = useState(markdownExample);
	const [debounced] = useDebouncedValue(markdown, 1000);
	let [isPending, startTransition] = useTransition();

	useEffect(() => {
		search == "create" && status === "authenticated" && authorize(session, [s.management]) ? setOpen(true) : setOpen(false);
		console.log(markdownExample);
		status === "authenticated" && session.isDisabled ? redirect("/medibook/signout") : null;
	}, [searchParams, status]);

	const handleSubmit = async () =>
		startTransition(async () => {
			const formData = new FormData(main);
			formData.set("markdown", markdown);
			const res = await createAnnouncement(formData);
			if (res.status == 200) {
				toast({ title: "Announcement Created" });
				router.push("/medibook/announcements");
				router.refresh();
			} else {
				toast({ title: "Couldn't publish the announcement", description: res.description, variant: "destructive" });
			}
		});

	return (
		<Sheet
			onOpenChange={() => {
				router.push("/medibook/announcements");
			}}
			open={open}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Create an Announcement</SheetTitle>
					<SheetDescription>
						Only Global Announcements can be added here, to add an announcement to
						<br /> a session, committee, or department please go to the respected session.
					</SheetDescription>
				</SheetHeader>
				<form action={createAnnouncement} id="main" className="col my-4 flex flex-col items-center gap-y-4">
					<div className="grid w-full gap-2">
						<Label htmlFor="title" className="mr-auto text-right">
							Title
						</Label>
						<Input required maxLength={128} name="title" className="w-[100%]"></Input>
					</div>
					<div className="grid w-full gap-2">
						<Label htmlFor="description" className="mr-auto text-right">
							Description
						</Label>
						<Input maxLength={256} name="description" className="w-[100%]" />
					</div>
					<div className="grid w-full gap-2">
						<Label htmlFor="scope" className="mr-auto text-right">
							Announcement Scope
						</Label>
						<Select defaultValue="global" required name="scope">
							<SelectTrigger value="@peduarte" className="col-span-3 min-h-[50px]">
								<SelectValue placeholder="Select a scope" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="global">Global</SelectItem>
								<SelectItem value="registered">Registered</SelectItem>
								<SelectItem value="alumni">Alumni</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Label className="my-auto mr-auto">Publishing Options</Label>
					<div className="border-200 flex w-[100%] flex-col gap-3 rounded-md border-[1px] p-2">
						<div className="row flex w-full gap-2">
							<Switch defaultChecked name="isMedibook" />
							<Label className="my-auto" htmlFor="isMedibook">
								Show in MediBook Feed
							</Label>
						</div>
						<div className="row flex w-full gap-2">
							<Switch defaultChecked name="isWebsite" />
							<Label className="my-auto" htmlFor="isWebsite">
								Show in Website Feed
							</Label>
						</div>
					</div>
					<Label className="my-auto mr-auto">Visibility Options</Label>
					<div className="border-200 flex w-[100%] flex-col gap-3 rounded-md border-[1px] p-2">
						<div className="row flex w-full gap-2">
							<Switch name="isAnonymous" />
							<Label className="my-auto" htmlFor="isAnonymous">
								Send as Anonymous
							</Label>
						</div>
						{status == "authenticated" && authorize(session, [s.sec]) && (
							<div className="row flex w-full gap-2">
								<Switch name="isSecretariat" />
								<Label className="my-auto" htmlFor="isSecretariat">
									Send as Secretariat
								</Label>
							</div>
						)}
						{status == "authenticated" && authorize(session, [s.board, s.admins]) && (
							<div className="row flex w-full gap-2">
								<Switch name="isBoard" />
								<Label className="my-auto" htmlFor="isBoard">
									Send as Board
								</Label>
							</div>
						)}
					</div>
					{status == "authenticated" && authorize(session, [s.admins, s.board, s.highsec]) && (
						<div className="grid w-full gap-2">
							<Label htmlFor="email" className="mr-auto text-right">
								Email Distribution
							</Label>
							<Select disabled defaultValue="false" name="email">
								<SelectTrigger value="email" className="col-span-3 min-h-[50px]">
									<SelectValue placeholder="Select a scope" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="true">Everyone in Selected Scope</SelectItem>
										<SelectItem value="consent">Everyone in Selected Scope who has joined the mailing list</SelectItem>
										<SelectItem value="false">
											No One <strong>This feature isn't ready yet</strong>
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
					)}
					<div className="grid w-full gap-2">
						<Label htmlFor="email" className="mr-auto text-right">
							Content
						</Label>
						<Link className="font-light" href="https://youtu.be/4z0l5Kl2Q6E" target="_blank">
							Learn more about <strong className="text-blue-500">markdown</strong>.
						</Link>
						<Tabs defaultValue="content" className="w-full">
							<TabsList className="w-[100%]">
								<TabsTrigger className="w-[50%]" value="content">
									MarkDown
								</TabsTrigger>
								<TabsTrigger className="w-[50%]" value="preview">
									Preview
								</TabsTrigger>
							</TabsList>
							<TabsContent value="content">
								<div className="grid w-full gap-2">
									<Textarea onChange={(event) => setMarkdown(event.target.value)} name="markdown" className="col-span-3 min-h-[500px]" value={markdown} />
								</div>
							</TabsContent>
							<TabsContent value="preview">
								<div className="grid w-[100%] gap-2">
									<ReactMarkdown className="h-auto min-h-[500px] w-[100%] max-w-[492.5px] rounded-md border-[1px] border-gray-200 p-3">{debounced}</ReactMarkdown>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</form>
				<SheetFooter>
					<Button onClick={handleSubmit} disabled={isPending} form="main" className="mt-4 flex w-auto" type="submit">
						{isPending ? "Loading" : "Publish"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
