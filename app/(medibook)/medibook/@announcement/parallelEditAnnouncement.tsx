"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { Dropdown, DropdownButton, DropdownHeading, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { useFlushState } from "@/hooks/useFlushState";
import { Select } from "@/components/select";
import { toast } from "sonner";
import { TopBar } from "../client-components";
import { Divider } from "@/components/divider";
import { Subheading } from "@/components/heading";
import { Text } from "@/components/text";
import { Listbox, ListboxOption } from "@/components/listbox";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/textarea";
import { cn } from "@/lib/cn";
import { Suspense, useEffect, useState } from "react";
import { MDXClient } from "next-mdx-remote-client/csr";
import { useDebouncedValue } from "@mantine/hooks";
import { serialize } from "next-mdx-remote-client/serialize";
import { Link } from "@/components/link";
import { announcementWebsitecomponents } from "./default";
import { editAnnouncement } from "./actions";
import { SlugInput } from "@/components/slugInput";

export function ModalEditAnnouncement({ selectedAnnouncement }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: authSession } = useSession();
	const [isLoading, setIsLoading] = useFlushState(false);
	const [markDown, setMarkDown] = useState(selectedAnnouncement?.markdown);
	const [serializedMarkDown, setSerializedMarkDown] = useState("");
	const [debouncedMarkDown] = useDebouncedValue(markDown, 5000);

	function onClose() {
		removeSearchParams({ "edit-announcement": "" }, router);
		router.refresh();
	}

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		const res = await editAnnouncement(formData, selectedAnnouncement.id);
		if (res?.ok) {
			toast.success(res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const createPreview = async () => {
		toast.loading("Creating Preview.", {
			id: "preview",
		});
		const content = await serialize({ source: markDown });
		setSerializedMarkDown(content);
		toast.success("Preview Created.", {
			id: "preview",
		});
	};

	useEffect(() => {
		if (markDown) createPreview();
	}, [debouncedMarkDown]);

	useEffect(() => {
		setMarkDown(selectedAnnouncement?.markdown);
	}, [selectedAnnouncement]);

	const fullName =
		selectedAnnouncement?.user?.displayName || `${selectedAnnouncement?.user?.officialName} ${selectedAnnouncement?.user?.officialSurname}`;

	if (!searchParams.has("edit-announcement")) return null;
	if (!selectedAnnouncement) return null;
	return (
		<form id="publishAnnouncement" action={handleSubmit}>
			<TopBar title="Edit Announcement" hideSearchBar />
			<Divider className="mb-10 mt-4" soft />
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Privacy</Subheading>
					<Text>
						Select whether to display your name on the announcement or not. The management can see who shared an announcement even if you hide your
						name.
					</Text>
				</div>
				<div className="my-auto">
					<Listbox name="privacy" defaultValue={selectedAnnouncement.privacy} disabled={isLoading}>
						<ListboxOption value="NORMAL">{fullName}</ListboxOption>
						<ListboxOption value="ANONYMOUS">Anonymous</ListboxOption>
						{authorize(authSession, [s.management]) && <ListboxOption value="SECRETARIAT">Secretariat</ListboxOption>}
						{authorize(authSession, [s.director, s.sd, s.admins]) && <ListboxOption value="BOARD">Board of Directors</ListboxOption>}
					</Listbox>
				</div>
			</section>
			<Divider className="my-10" soft />
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Pin Announcement</Subheading>
					<Text>Pinned announcements are shown at the top of the list.</Text>
				</div>
				<div className="my-auto">
					<Listbox name="isPinned" defaultValue={selectedAnnouncement.isPinned ? "true" : "false"} disabled={isLoading}>
						<ListboxOption value="true">Pinned</ListboxOption>
						<ListboxOption value="false">Not Pinned</ListboxOption>
					</Listbox>
				</div>
			</section>
			<Divider className="my-10" soft />
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Title</Subheading>
					<Text>
						Title of the announcement and subject of emails.
						<br />
						<em>Min 10, Max 100 characters.</em>
					</Text>
				</div>
				<div className="my-auto flex flex-col gap-4 md:flex-row">
					<Input defaultValue={selectedAnnouncement.title} required type="text" minLength={10} maxLength={100} name="title" />
				</div>
			</section>
			<Divider className="my-10" soft />
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Slug</Subheading>
					<Text>
						A friendly title to appear in the URL.
						<br />
						<em>Min 10, Max 100 characters.</em>
					</Text>
				</div>
				<div className="my-auto flex flex-col gap-4 md:flex-row">
					<SlugInput separator="-" defaultValue={selectedAnnouncement.slug} minLength={10} maxLength={100} name="slug" />
				</div>
			</section>
			<Divider className="my-10" soft />
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Description</Subheading>
					<Text>
						The text which will appear below the announcement before it's opened or the text which will appear below the email before it's opened.
						<br />
						<em>Max 500 characters.</em>
					</Text>
				</div>
				<div className="my-auto flex flex-col gap-4 md:flex-row">
					<Textarea defaultValue={selectedAnnouncement.description} type="text" maxLength={100} name="description" />
				</div>
			</section>
			<Divider className="my-10" soft />
			<section className="grid gap-x-8 gap-y-6">
				<div className="space-y-1">
					<Subheading>Announcement Content (Markdown)</Subheading>
					<Text>
						The content of the announcement in markdown format. Learn more about <Link href={"/wiki/markdown"}>markdown</Link>
						<br />
						<em>Max 25,000 characters.</em>
					</Text>
				</div>
				<div className="my-auto flex flex-col gap-4 md:flex-row">
					<Textarea
						className="max-h-[500px] min-h-64"
						required
						value={markDown}
						onChange={(e) => {
							setMarkDown(e.target.value);
						}}
						type="text"
						minLength={5}
						maxLength={25000}
						name="markdown"
					/>
				</div>
			</section>
			<Divider className="my-10" soft />
			<div id="notice" className="flex justify-end gap-4">
				<Button type="reset" form="publishAnnouncement" disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button disabled={isLoading} form="publishAnnouncement" type="submit">
					Save
				</Button>
			</div>
			<Divider className={cn("mt-10", serializedMarkDown && debouncedMarkDown && "invisible")} soft />
			{serializedMarkDown && debouncedMarkDown && (
				<div className="max-w-full overflow-hidden bg-zinc-100 p-4">
					<Text className="">Preview</Text>
					<Suspense fallback={<div>Error</div>}>
						<MDXClient onError={<div>Error</div>} components={announcementWebsitecomponents} {...serializedMarkDown} />
					</Suspense>
				</div>
			)}
		</form>
	);
}
