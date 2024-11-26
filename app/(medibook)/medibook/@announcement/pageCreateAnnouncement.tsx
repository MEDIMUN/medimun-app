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
import { authorize, s } from "@/lib/authorize";
import { cn } from "@/lib/cn";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { useSession } from "next-auth/react";
import { notFound, redirect, useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "../client-components";
import { Code, Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import { publishAnnouncement } from "./actions";
import {
	announcementWebsitecomponents,
	authorizedToEditAnnouncement,
	authorizedToEditAnnouncementMap,
	innerAnnouncementScopeList,
	typeGreaterScopeMapList,
} from "./default";
import { serialize } from "next-mdx-remote-client/serialize";
import { MDXClient } from "next-mdx-remote-client/csr";
import { useDebouncedValue } from "@mantine/hooks";
import { SlugInput } from "@/components/slugInput";

export function PageCreateAnnouncement({
	committeeId,
	departmentId,
	type,
	returnUrl,
}: {
	type: "globalAnnouncement" | "sessionAnnouncement" | "committeeAnnouncement" | "departmentAnnouncement";
	returnUrl: string;
	committeeId?: string;
	departmentId?: string;
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
	const [debouncedMarkDown] = useDebouncedValue(markDown, 5000);

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		formData.append("scope", innerScope);
		formData.append("type", typeInput);
		formData.append("scopeType", type);
		const res = await publishAnnouncement(formData, params);
		if (res?.ok) {
			toast.success(res?.message);
			if (returnUrl) router.push(returnUrl);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	useEffect(() => {
		if (greaterScope) setInnerScope(innerAnnouncementScopeList[greaterScope].map((scope) => scope.value));
	}, [greaterScope]);

	const authGreaterScope = typeGreaterScopeMapList[type]?.[0]?.value;
	const authInnerScope = innerAnnouncementScopeList[authGreaterScope]?.map((scope) => scope?.value);
	const authBooleanMap = authInnerScope.map((scope) => authorizedToEditAnnouncementMap(authSession, committeeId, departmentId)[scope]);

	useEffect(() => {
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
		if (debouncedMarkDown) createPreview();
	}, [debouncedMarkDown]);

	if (status !== "authenticated") return null;

	const allowedEmailTypes = ["committeeAnnouncement", "departmentAnnouncement" /* "sessionAnnouncement" */];
	const isEmailAllowed = allowedEmailTypes.includes(type);

	const fullName = authSession.user.displayName || `${authSession.user.officialName} ${authSession.user.officialSurname}`;

	if (authBooleanMap.includes(false)) return notFound();

	return (
		<div className="mx-auto flex max-w-6xl h-full flex-col gap-6">
			<form id="publishAnnouncement" action={handleSubmit}>
				<TopBar title="Publish Announcement" hideBackdrop hideSearchBar />
				<Divider className="mb-10 mt-4" soft />
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
						<Text>Select wheter the announcement will be shown on the website and MediBook, will be emailed or both.</Text>
					</div>
					<div className="my-auto">
						<Listbox multiple value={typeInput} onChange={(val) => setTypeInput(val)} disabled={isLoading}>
							<ListboxOption disabled value="WEBSITE">
								Website and/or MediBook
							</ListboxOption>
							<ListboxOption disabled={!isEmailAllowed} value="EMAIL">
								<ListboxLabel>Email</ListboxLabel>
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
						<Listbox name="privacy" defaultValue="NORMAL" disabled={isLoading}>
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
						<Listbox name="isPinned" defaultValue="false" disabled={isLoading}>
							<ListboxOption value="true">Pinned</ListboxOption>
							<ListboxOption value="false">Not Pinned</ListboxOption>
						</Listbox>
					</div>
				</section>
				<Divider className="my-10" soft />
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>
							Title <Code>Required</Code>
						</Subheading>
						<Text>
							Title of the announcement and subject of emails.
							<br />
							<em>Min 3, Max 200 characters.</em>
						</Text>
					</div>
					<div className="my-auto flex flex-col gap-4 md:flex-row">
						<Input required type="text" minLength={3} maxLength={100} name="title" />
					</div>
				</section>
				<Divider className="my-10" soft />
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>
							Slug <Code>Optional</Code>
						</Subheading>
						<Text>
							A friendly title to appear in the URL.
							<br />
							<em>Min 10, Max 100 characters.</em>
						</Text>
					</div>
					<div className="my-auto flex flex-col gap-4 md:flex-row">
						<SlugInput separator="-" minLength={10} maxLength={100} name="slug" />
					</div>
				</section>
				<Divider className="my-10" soft />
				<section className="grid gap-x-8 gap-y-6">
					<div className="space-y-1">
						<Subheading>
							Announcement Content (Markdown) <Code>Required</Code>
						</Subheading>
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
					<Button type="reset" form="publishAnnouncement" disabled={isLoading} plain onClick={() => router.push(returnUrl)}>
						Cancel
					</Button>
					<Button loading={isLoading} disabled={isLoading} form="publishAnnouncement" type="submit">
						Publish
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
		</div>
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
