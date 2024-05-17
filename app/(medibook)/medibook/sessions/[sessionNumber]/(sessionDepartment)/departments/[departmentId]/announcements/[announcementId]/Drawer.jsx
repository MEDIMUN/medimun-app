"use client";
import { Input, Textarea, Button, RadioGroup, Radio } from "@nextui-org/react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ReactMarkdown from "react-markdown";
import { useDebouncedState } from "@mantine/hooks";
import { Tabs, Tab } from "@nextui-org/react";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { editAnnouncement } from "./edit-announcement.server";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { useDebouncedValue } from "@mantine/hooks";
import { deleteAnnouncement } from "./delete-announcement.server";
import Link from "next/link";

export default function Drawer({ announcement }) {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/medibook/signout");
	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const [isOpen, setIsOpen] = useState(false);
	const [markdown, setMarkdown] = useState(announcement.markdown);
	const [debounced] = useDebouncedValue(markdown, 1000);

	useEffect(() => {
		setIsOpen(searchParams.get("edit") == "" && status === "authenticated" && (authorize(session, [s.management]) || session.currentRoles.some((role) => role.name === "Manager" && role.committeeId == props.committeeId)));
	}, [searchParams, status, session]);

	async function createAnnouncementWrapper(formData) {
		formData.append("announcementId", announcement.id);
		const res = await editAnnouncement(formData);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res?.ok) {
			router.push(searchParams.get("saveurl") || "?#");
			router.refresh();
		}
	}

	async function deleteAnnouncementWrapper() {
		const res = await deleteAnnouncement(announcement.id);
		if (res?.ok) {
			if (res) router.push("./");
			router.refresh();
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		}
	}

	return (
		<Sheet
			onOpenChange={() => {
				router.push("?#");
			}}
			open={isOpen}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Create an Announcement</SheetTitle>
					<SheetDescription>Announcements published from here will only be visible in this committee.</SheetDescription>
				</SheetHeader>
				<form action={createAnnouncementWrapper} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
					<Input defaultValue={announcement.title} label="Title" labelPlacement="outside" placeholder=" " minLength={3} isRequired maxLength={128} name="title"></Input>
					<Input defaultValue={announcement.description} label="Description" labelPlacement="outside" placeholder=" " minLength={10} maxLength={200} name="description" />
					<RadioGroup defaultValue={announcement.privacy} size="sm" name="privacy" label="Publisher Privacy Options">
						<Radio value="ANONYMOUS">Send Anonymously</Radio>
						{status == "authenticated" && authorize(session, [s.sec]) && <Radio value="SECRETARIAT">Send as Secretariat</Radio>}
						{status == "authenticated" && authorize(session, [s.board]) && <Radio value="BOARD">Send as Board of Management</Radio>}
						<Radio value="NORMAL">Send Normally</Radio>
					</RadioGroup>
					<Tabs defaultValue="content">
						<Tab title="MarkDown" key="markdown">
							<Textarea isRequired placeholder=" " label="Announcement Text" labelPlacement="outside" maxLength={10000} onChange={(event) => setMarkdown(event.target.value)} name="markdown" className="col-span-3" value={markdown} />
						</Tab>
						<Tab title="Preview" value="preview">
							<ReactMarkdown className="h-auto min-h-[256px] w-[100%] max-w-[492.5px] rounded-md border-[1px] border-gray-200 p-3">{debounced}</ReactMarkdown>
						</Tab>
					</Tabs>
					<div className="flex flex-col gap-2">
						<Button form="delete" type="submit" color="danger" onClick={() => router.push("?#")}>
							Delete
						</Button>
						<Button as={Link} href={searchParams.get("saveurl") || "?#"}>
							Cancel
						</Button>
						<Button type="submit">Save</Button>
					</div>
				</form>
				<form id="delete" action={deleteAnnouncementWrapper}></form>
			</SheetContent>
		</Sheet>
	);
}
