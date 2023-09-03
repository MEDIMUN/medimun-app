"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from "react-markdown";
import { useDebouncedState } from "@mantine/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "./create-announcement.server";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { useDebouncedValue } from "@mantine/hooks";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SearchBar() {
	const { data: session, status } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { toast } = useToast();

	const [isOpen, setIsOpen] = useState(false);
	const [markdown, setMarkdown] = useState("# Write the announcement here");
	const [debounced] = useDebouncedValue(markdown, 1000);

	useEffect(() => {
		setIsOpen(searchParams.get("create") == "" && status === "authenticated" && authorize(session, [s.admins, s.management], status));
	}, [searchParams, status, session]);

	async function createAnnouncementHandler(formData) {
		const res = await createAnnouncement(formData);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res?.ok) redirect("/medibook/announcements");
	}

	if (status !== "authenticated") return;

	return (
		<Sheet
			onOpenChange={() => {
				router.push("/medibook/announcements");
			}}
			open={isOpen}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Create Global Announcement</SheetTitle>
					<SheetDescription>You can create a global announcement here.</SheetDescription>
				</SheetHeader>
				<form action={createAnnouncementHandler} id="main" className="flex flex-col gap-4 pb-2 pt-4">
					<Label htmlFor="title" className="mr-auto text-right">
						Title
					</Label>
					<Input required maxLength={128} name="title" className="w-[100%]"></Input>
					<Label htmlFor="description" className="mr-auto text-right">
						Description
					</Label>
					<Input maxLength={256} name="description" className="w-[100%]" />
					<Label>Alumni Options</Label>
					<div className="mr-auto flex items-center space-x-2">
						<Checkbox name="isAlumni" id="isAlumni" />
						<label htmlFor="isAlumni" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Show only to Alumni
						</label>
					</div>
					<Label>Visibility Options</Label>
					<div className="mr-auto flex items-center space-x-2">
						<Checkbox name="isAnonymous" id="isAnonymous" />
						<label htmlFor="isAnonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Send as Anonymous
						</label>
					</div>
					{authorize(session, [s.board]) && (
						<div className="mr-auto flex items-center space-x-2">
							<Checkbox name="isBoard" id="isBoard" />
							<label htmlFor="isBoard" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
								Send as Board
							</label>
						</div>
					)}
					{authorize(session, [s.sec]) && (
						<div className="mr-auto flex items-center space-x-2">
							<Checkbox name="isSecretariat" id="isSecretariat" />
							<label htmlFor="isSecretariat" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
								Send as Secretariat
							</label>
						</div>
					)}
					<Label>Publishing Scope</Label>
					<RadioGroup name="scope" defaultValue="isMedibook">
						<div className="flex items-center space-x-2">
							<RadioGroupItem name="isWebsite" value="isWebsite" id="isWebsite" />
							<Label htmlFor="isWebsite">Publish to Website</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem name="isMediBook" value="isMedibook" id="isMediBook" />
							<Label htmlFor="isMediBook">Publish to MediBook (Here)</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem name="isBoth" value="isBoth" id="isBoth" />
							<Label htmlFor="isBoth">Both</Label>
						</div>
					</RadioGroup>
					<div className="grid w-full gap-2">
						<Label htmlFor="email" className="mr-auto text-right">
							Content
						</Label>
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
					<Button form="main" className="mt-4 flex w-auto" type="submit">
						Publish
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
