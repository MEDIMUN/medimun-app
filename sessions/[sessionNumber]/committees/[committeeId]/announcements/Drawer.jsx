"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { useDebouncedState } from "@mantine/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "./create-announcement.server";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { useDebouncedValue } from "@mantine/hooks";
import { Checkbox } from "@/components/ui/checkbox";

export default function SearchBar({ props }) {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/medibook/signout");
	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const [isOpen, setIsOpen] = useState(false);
	const [markdown, setMarkdown] = useState("# Write the announcement here");
	const [debounced] = useDebouncedValue(markdown, 1000);

	useEffect(() => {
		setIsOpen(searchParams.get("create") == "" && status === "authenticated" && (authorize(session, [s.management]) || session.currentRoles.some((role) => role.name === "Manager" && role.committeeId == props.committeeId)));
	}, [searchParams, status, session]);

	async function createAnnouncementWrapper(formData) {
		const res = await createAnnouncement(formData);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res?.ok) {
			router.push(`/medibook/sessions/${props.sessionNumber}/committees/${props.committeeSlug || props.committeeId}/announcements`);
			router.refresh();
		}
	}

	return (
		<Sheet
			onOpenChange={() => {
				router.push(`/medibook/sessions/${props.sessionNumber}/committees/${props.committeeId}/announcements`);
			}}
			open={isOpen}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Create an Announcement</SheetTitle>
					<SheetDescription>Announcements published from here will only be visible in this committee.</SheetDescription>
				</SheetHeader>
				<form action={createAnnouncementWrapper} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
					<Input required name="committeeId" id="committeeId" type="hidden" value={props.committeeId} />
					<Label htmlFor="title">Title</Label>
					<Input minLength={3} required maxLength={128} name="title" className="w-[100%]"></Input>
					<Label htmlFor="description">Description</Label>
					<Input required minLength={10} maxLength={200} name="description" />
					<Label>Visibility Options</Label>
					<div className="mr-auto flex items-center space-x-2">
						<Checkbox name="isAnonymous" id="isAnonymous" />
						<label htmlFor="isAnonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Send as Anonymous
						</label>
					</div>
					{status == "authenticated" && authorize(session, [s.sec]) && (
						<div className="mr-auto flex items-center space-x-2">
							<Checkbox name="isSecretariat" id="isSecretariat" />
							<label htmlFor="isSecretariat" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
								Send as Secretariat
							</label>
						</div>
					)}
					{status == "authenticated" && authorize(session, [s.board]) && (
						<div className="mr-auto flex items-center space-x-2">
							<Checkbox name="isBoard" id="isBoard" />
							<label htmlFor="isBoard" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
								Send as Board
							</label>
						</div>
					)}
					<div className="grid w-full gap-2">
						<Label htmlFor="markdown" className="mr-auto text-right">
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
									<Textarea required maxLength={10000} minLength={10} onChange={(event) => setMarkdown(event.target.value)} name="markdown" className="col-span-3 min-h-[500px]" value={markdown} />
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
