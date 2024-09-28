"use client";

import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Divider } from "@/components/divider";
import { Description, Field, Label } from "@/components/fieldset";
import { Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Select } from "@/components/select";
import { useFlushState } from "@/hooks/useFlushState";
import { authorize, authorizeChairCommittee, authorizeManagerDepartment, s } from "@/lib/authorize";
import { cn } from "@/lib/cn";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadResource } from "./action";
import { greaterScopeList, innerScopeList, searchParamsGreaterScopeMap, useableSearchParams } from "./default";

export function ModalUploadResource() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: authSession, status } = useSession();
	const isManagement = authorize(authSession, [s.management]);
	const inputRef = useRef(null);
	const [file, setFile] = useState(null);
	const [fileUrl, setFileUrl] = useState(null);
	const [url, setUrl] = useState("");
	const [greaterScope, setGreaterScope] = useState("");
	const [innerScope, setInnerScope] = useState([]);
	const [isLoading, setIsLoading, setIsFlushLoading] = useFlushState(false);

	function onClose() {
		setGreaterScope("");
		setFile(null);
		setUrl("");
		setInnerScope([]);
		setFile(null);
		removeSearchParams(
			{
				uploadsessionresource: "",
				uploadcommitteeresource: "",
				uploaddepartmentresource: "",
				uploadglobalresource: "",
				uploadresource: "",
				uploadsystemresource: "",
				uploadsessionprospectus: "",
			},
			router
		);
	}

	const handleFileChange = (event) => {
		const fileObj = event.target.files && event?.target?.files[0];
		if (!fileObj) return;
		setFile(fileObj);
		const fileURL = URL.createObjectURL(fileObj);
		setFileUrl(fileURL);
	};

	const onUrlChange = (e) => {
		let initialValue = e;
		initialValue = initialValue.trim().toLowerCase().replace(" ", "").replace("https://", "").replace("http://", "");
		setUrl(initialValue);
	};

	const searchParamsGreaterScopeOpen =
		status === "authenticated"
			? {
					uploadsessionprospectus: isManagement,
					uploadglobalresource: authorize(authSession, [s.admins, s.director, s.sd]),
					uploadsessionresource: isManagement && searchParams.get("uploadsessionresource"),
					uploadcommitteeresource:
						(isManagement ||
							authorizeChairCommittee(
								[...authSession.user.pastRoles, ...authSession.user.currentRoles],
								searchParams.get("uploadcommitteeresource")
							)) &&
						searchParams.get("uploadcommitteeresource"),
					uploaddepartmentresource:
						(isManagement ||
							authorizeManagerDepartment(
								[...authSession.user.pastRoles, ...authSession.user.currentRoles],
								searchParams.get("uploaddepartmentresource")
							)) &&
						searchParams.get("uploaddepartmentresource"),
					uploadresource: true,
					uploadsystemresource: authorize(authSession, [s.admins, s.sd]),
			  }
			: {};

	const allSearchParams = Object.fromEntries(searchParams?.entries() || []);
	const allSearchParamsKeys = [...(searchParams?.keys() || [])].filter((key) => useableSearchParams?.includes(key));

	const currentGreaterScope = searchParamsGreaterScopeMap[allSearchParamsKeys[0]];
	const filteredGreaterScopeList = greaterScopeList.filter((scope) => currentGreaterScope?.includes(scope.value));
	const openConditionBasedOnSearchParams = searchParamsGreaterScopeOpen[allSearchParamsKeys[0]];

	async function uploadFileHandler(formData) {
		setIsFlushLoading(true);
		if (formData.has("file")) toast.loading(`Uploading ${formData.get("name")}`, { id: "upload-resource" });
		formData.append("scope", innerScope);
		const res = await uploadResource(formData, allSearchParams);
		if (res?.ok) {
			toast.success(res?.message, {
				id: "upload-resource",
			});
			onClose();
		} else {
			toast.error(res?.message, {
				id: "upload-resource",
			});
		}
		setIsLoading(false);
		router.refresh();
	}

	useEffect(() => {
		if (greaterScope) setInnerScope(innerScopeList[greaterScope].map((scope) => scope.value));
	}, [greaterScope]);

	useEffect(() => {
		return () => {
			if (fileUrl) URL.revokeObjectURL(fileUrl);
		};
	}, [fileUrl]);

	const isOpen = !!openConditionBasedOnSearchParams;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Upload Resource</DialogTitle>
			<DialogBody>
				<div className="mb-4 flex flex-col gap-5">
					<Field>
						<Label>Resource Scope or Type</Label>
						<Description>Select where the resource will appear.</Description>
						<Listbox disabled={isLoading} onChange={(val) => setGreaterScope(val)}>
							{filteredGreaterScopeList.map((scope) => (
								<ListboxOption key={scope.value} value={scope.value} disabled={scope.disabled}>
									<ListboxLabel>{scope.text}</ListboxLabel>
									<ListboxDescription>{scope.description}</ListboxDescription>{" "}
								</ListboxOption>
							))}
						</Listbox>
					</Field>
					{greaterScope && (
						<Field className={cn(innerScopeList[greaterScope]?.length > 1 ? "block" : "hidden")}>
							<Label>Further Customize Scope</Label>
							<Description>
								Changes which roles within the scope can see the resource.
								<br />
								Don&apos;t change this unless you know what you are doing.
							</Description>
							<Listbox disabled={isLoading} multiple value={innerScope} onChange={(val) => setInnerScope(val)}>
								{innerScopeList[greaterScope]?.map((scope) => (
									<ListboxOption key={scope.value} value={scope.value} disabled={scope.disabled}>
										<ListboxLabel>{scope.text}</ListboxLabel>
										<ListboxDescription>{scope.description}</ListboxDescription>
									</ListboxOption>
								))}
							</Listbox>
						</Field>
					)}
				</div>
				<form action={uploadFileHandler} id="uploadResource" className="grid grid-cols-1 gap-4">
					{!isLoading && !url && <input hidden ref={inputRef} name="file" type="file" onChange={handleFileChange} />}
					{!file && !!innerScope.length && (
						<div className="grid grid-cols-1 gap-4 rounded-lg bg-zinc-100 p-4 shadow-md ring-1 ring-zinc-950/10">
							{!file && !url && (
								<>
									<Field>
										<Label>Direct File Upload</Label>
										<Description>Max 30MB. Documents and images only, use the drive upload for other file types.</Description>
										<Button className="mt-2 w-full" onClick={() => inputRef.current.click()}>
											Select a File
										</Button>
									</Field>
									<div className="flex">
										<Divider className="my-auto w-[40%]" />
										<p className="w-[20%] text-center text-xs">OR</p>
										<Divider className="my-auto w-[45%]" />
									</div>
								</>
							)}
							{!file && (
								<>
									<Field>
										<Label>External Link</Label>
										<Description>The external resource must be publicly accessible.</Description>
										<Input
											disabled={isLoading}
											onChange={(e) => onUrlChange(e.target.value)}
											value={url}
											placeholder="Paste Drive Link, Externa URL, or YouTube Link"
											maxLength={500}
											minLength={5}
											type="text"
											name="driveUrl"
										/>
									</Field>
								</>
							)}
						</div>
					)}
					{(file || url) && !!innerScope.length && (
						<>
							<Field>
								<Label>Name</Label>
								<Input defaultValue={file?.name} disabled={isLoading} required name="name" maxLength={250} />
							</Field>

							<Field>
								<Label>File Privacy</Label>
								<Description>
									Private Files can only be viewed by the management. Public files can be viewed by the scope the file is shared in.
								</Description>
								<Select disabled={isLoading} name="isPrivate" defaultValue="false">
									<option value="false">Public</option>
									<option value="true">Private</option>
								</Select>
							</Field>

							<Field>
								<Label>Pin Resource</Label>
								<Description>Pinned resources will be shown at the top of the resource list.</Description>
								<Select disabled={isLoading} name="isPinned" defaultValue="false">
									<option value="false">Not Pinned</option>
									<option value="true">Pinned</option>
								</Select>
							</Field>

							<Field>
								<Label>Share Anonymously</Label>
								<Description>
									Anonymously shared files will not show the uploader&apos;s name. Management members can still see the uploader&apos;s name.
								</Description>
								<Select disabled={isLoading} name="isAnonymous" defaultValue="false">
									<option value="false">Not Anonymous</option>
									<option value="true">Anonymous</option>
								</Select>
							</Field>
						</>
					)}
				</form>
				{file && (
					<div className="mt-4 grid w-full grid-cols-1 gap-2 overflow-hidden rounded-xl border p-2">
						{file?.type.includes("image") && <img alt="Uploaded file image" className="w-full rounded-lg" src={fileUrl} />}
						{file?.type.includes("pdf") && <iframe className="aspect-square h-auto w-full rounded-lg" src={`${fileUrl}#toolbar=0&navpanes=0`} />}
						{!file?.type.includes("image") && !file?.type.includes("pdf") && <Subheading className="mb-[6px] ml-1">{file?.name}</Subheading>}
						<Button disabled={isLoading} color="red" className="w-full" onClick={() => setFile(null)}>
							Remove File
						</Button>
					</div>
				)}
			</DialogBody>
			<DialogDescription>
				Don&apos;t close or refresh the page until the upload is complete. We don&apos;t guarantee the safety of files, more at our{" "}
				<Link className="underline hover:text-primary" href="/terms#files" target="_blank">
					terms of service
				</Link>
				.
			</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button disabled={isLoading} loading={isLoading} form="uploadResource" type="submit">
					Upload
				</Button>
			</DialogActions>
		</Dialog>
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
