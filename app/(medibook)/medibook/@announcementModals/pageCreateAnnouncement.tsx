"use client";

import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { Description, Field, Label } from "@/components/fieldset";
import { Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Select } from "@/components/select";
import { useFlushState } from "@/hooks/use-flush-state";
import { authorize, authorizeChairCommittee, authorizeManagerDepartment, s } from "@/lib/authorize";
import { cn } from "@/lib/cn";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "../client-components";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import { publishAnnouncement } from "./action";
import { announcementWebsitecomponents, innerAnnouncementScopeList, typeGreaterScopeMapList } from "./default";
import { serialize } from "next-mdx-remote-client/serialize";
import { MDXClient } from "next-mdx-remote-client/csr";
import { useDebouncedValue } from "@mantine/hooks";

export function PageCreateAnnouncement({
	type,
	returnUrl,
}: {
	type: "globalAnnouncement" | "sessionAnnouncement" | "committeeAnnouncement" | "departmentAnnouncement";
}) {
	const router = useRouter();
	const params = useParams();
	const { data: authSession, status } = useSession();
	const [greaterScope, setGreaterScope] = useState("");
	const [innerScope, setInnerScope] = useState([]);
	const [isLoading, setIsLoading] = useFlushState(false);
	const [typeInput, setTypeInput] = useState(["WEBSITE"]);
	const [markDown, setMarkDown] = useState();
	const [serializedMarkDown, setSerializedMarkDown] = useState("");
	const [debouncedMarkDown] = useDebouncedValue(markDown, 1000);

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		formData.append("scope", innerScope);
		formData.append("type", typeInput);
		const res = await publishAnnouncement(formData, params);
		if (res?.ok) {
			toast.success(res?.message);
			if (returnUrl) router.push(returnUrl);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	useEffect(() => {
		if (greaterScope) setInnerScope(innerAnnouncementScopeList[greaterScope].map((scope) => scope.value));
	}, [greaterScope]);

	const createPreview = async () => {
		toast.loading("Creating Preview.", {
			id: "preview",
		});
		const content = await serialize({ source: debouncedMarkDown });
		setSerializedMarkDown(content);
		toast.success("Preview Created.", {
			id: "preview",
		});
	};

	useEffect(() => {
		createPreview();
	}, [debouncedMarkDown]);

	if (status !== "authenticated") return null;

	const fullName = authSession.user.displayName || `${authSession.user.officialName} ${authSession.user.officialSurname}`;

	return (
		<form id="publishAnnouncement" action={handleSubmit}>
			<TopBar title="Publish Announcement" hideSearchBar />
			<Divider className="my-10" soft />
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Scope</Subheading>
					<Text>Select where the announcement will be shared in.</Text>
				</div>
				<div className="my-auto flex flex-col gap-4">
					<Listbox disabled={isLoading} onChange={(val) => setGreaterScope(val)}>
						{typeGreaterScopeMapList[type].map((scope) => (
							<ListboxOption key={scope.value} value={scope.value}>
								<ListboxLabel>{scope.text}</ListboxLabel>
							</ListboxOption>
						))}
					</Listbox>
					<Listbox disabled={isLoading || !greaterScope} multiple value={innerScope} onChange={(val) => setInnerScope(val)}>
						{innerAnnouncementScopeList[greaterScope]?.map((scope) => (
							<ListboxOption key={scope.value} value={scope.value} disabled={scope.disabled}>
								<ListboxLabel>{scope.text}</ListboxLabel>
								<ListboxDescription>{scope.description}</ListboxDescription>
							</ListboxOption>
						))}
					</Listbox>
				</div>
			</section>
			<Divider className="my-10" soft />
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Distribution Type</Subheading>
					<Text>
						Select wheter the announcement will be shown on the website and MediBook, will be emailed or both.
						<br />
						<em>
							The email option is not available yet.
							<Link className="cursor-pointer text-primary hover:underline" href={`/medibook/users/111111111111`}>
								{" Berzan "}
							</Link>
							is working on it but he may have forgotten, please ask him if you really need this.
						</em>
					</Text>
				</div>
				<div className="my-auto">
					<Listbox multiple value={typeInput} onChange={(val) => setTypeInput(val)} disabled={true || isLoading}>
						<ListboxOption value="WEBSITE">Website and/or MediBook</ListboxOption>
						<ListboxOption disabled value="EMAIL">
							<ListboxLabel>Email</ListboxLabel>
							<ListboxDescription>Not Available</ListboxDescription>
						</ListboxOption>
					</Listbox>
				</div>
			</section>
			<Divider className="my-10" soft />
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Privacy</Subheading>
					<Text>
						Select whether to display your name on the announcement or not. The management can see who shared an announcement even if you hide your
						name.
					</Text>
				</div>
				<div className="my-auto">
					<Listbox name="privacy" disabled={isLoading}>
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
					<Subheading>Title</Subheading>
					<Text>
						Title of the announcement and subject of emails.
						<br />
						<em>Min 10, Max 100 characters.</em>
					</Text>
				</div>
				<div className="my-auto flex flex-col gap-4 md:flex-row">
					<Input required type="text" minLength={10} maxLength={100} name="title" />
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
					<Textarea type="text" maxLength={100} name="description" />
				</div>
			</section>
			<Divider className="my-10" soft />
			<section className="grid gap-x-8 gap-y-6">
				<div className="space-y-1">
					<Subheading>Announcement Content (Markdown)</Subheading>
					<Text>
						The content of the announcement in markdown format. Learn more about <Link href={"/wiki/markdown"}>markdown</Link>
						<br />
						<em>Min 10, Max 10,000 characters.</em>
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
						minLength={10}
						maxLength={10000}
						name="markdown"
					/>
				</div>
			</section>
			<Divider className="my-10" soft />
			<div id="notice" className="flex justify-end gap-4">
				<Button type="reset" form="publishAnnouncement" disabled={isLoading} plain onClick={() => router.push(returnUrl)}>
					Cancel
				</Button>
				<Button disabled={isLoading} form="publishAnnouncement" type="submit">
					Publish
				</Button>
			</div>
			<Divider className="my-10" soft />
			{serializedMarkDown && (
				<>
					<Text className="ml-2 !text-lg">Preview</Text>
					<div className="rounded-md bg-zinc-100/20 p-4 ring-1 ring-zinc-950/20">
						<Suspense fallback={<div>Error</div>}>
							<MDXClient onError={<div>Error</div>} components={announcementWebsitecomponents} {...serializedMarkDown} />
						</Suspense>
					</div>
				</>
			)}
			<Subheading className="mt-10 font-thin">
				{"Content of announcements should follow "}
				<Link className="underline hover:text-primary" href="/conduct#announcements" target="_blank">
					code of conduct
				</Link>
				{" and "}
				<Link className="underline hover:text-primary" href="/conduct#announcements" target="_blank">
					terms of service
				</Link>
				.
			</Subheading>
		</form>
	);
}

/* enum ResourcePrivacyTypes {
	SYSTEM
	//
	WEBSITE
	//
	CHAIR
	MANAGER
	DELEGATE
	MEMBER
	SECRETARIAT
	DIRECTORS
	//
	SESSIONWEBSITE
	//
	SESSIONPROSPECTUS
	//
	SESSIONCHAIR
	SESSIONMANAGER
	SESSIONMEMBER
	SESSIONDELEGATE
	SESSIONSECRETARIAT
	SESSIONDIRECTORS
	//
	COMMITEEWEBSITE
	//
	COMMITTEECHAIR
	COMMITTEEMANAGER
	COMMITTEEMEMBER
	COMMITTEEDELEGATE
	COMMITTEESECRETARIAT
	COMMITTEEDIRECTORS
	//
	DEPARTMENTWEBSITE
	//
	DEPARTMENTMANAGER
	DEPARTMENTMEMBER
	DEPARTMENTSECRETARIAT
	DEPARTMENTDIRECTORS
 } */
