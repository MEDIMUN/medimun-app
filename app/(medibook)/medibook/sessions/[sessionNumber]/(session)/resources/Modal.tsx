"use client";

import { Label } from "@/components/ui/label";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition, useContext } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { Textarea } from "@nextui-org/react";
import { RadioGroup, Radio } from "@nextui-org/react";
import { Modal, ModalContent, AvatarGroup, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Input, Button, ButtonGroup } from "@nextui-org/react";
import { removeSearchParams } from "@/lib/searchParams";
import * as SolarIconSet from "solar-icon-set";
import { SidebarContext } from "@/app/(medibook)/providers";
import { uploadFile } from "./upload-file.server";

export default function Drawer({ edit, sessionNumber }) {
	const { data: session, status } = useSession();
	let { isHidden, setIsHidden } = useContext(SidebarContext);

	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const inputRef = useRef(null);
	const [file, setFile] = useState(null);
	const [fileUrl, setFileUrl] = useState(null);
	const [viewFile, setViewFile] = useState(false);
	const [initialIsHidden, setInitialIsHidden] = useState(false);

	const handleClick = () => {
		// 👇️ open file input box on click of another element
		inputRef.current.click();
	};

	const handleFileChange = (event) => {
		const fileObj = event.target.files && event.target.files[0];
		if (!fileObj) {
			return;
		}
		setFile(fileObj);
		console.log(fileObj);
		const fileURL = URL.createObjectURL(fileObj);
		setFileUrl(fileURL);
	};

	useEffect(() => {
		// Clean up the object URL to avoid memory leaks
		return () => {
			if (fileUrl) {
				URL.revokeObjectURL(fileUrl);
			}
		};
	}, [fileUrl]);

	async function uploadFileHandler(formData) {
		formData.append("sessionNumber", sessionNumber);
		const res = await uploadFile(formData);
		if (res) toast(res);
		if (res?.ok) {
			removeSearchParams({ add: "", edit: "", delete: "" }, router);
			setFile();
			router.refresh();
		}
	}

	return (
		<>
			<Modal
				isOpen={(searchParams.has("add") || searchParams.has("edit")) && status === "authenticated" && authorize(session, [s.management])}
				onOpenChange={() => {
					removeSearchParams({ add: "", edit: "" }, router);
					setFile();
				}}>
				<ModalContent className="overflow-y-auto" position="right" size="content">
					<ModalHeader>Upload File</ModalHeader>
					<ModalBody>
						<form action={uploadFileHandler} id="main" className="grid grid-cols-1 gap-4">
							<Input label="Name" size="lg" name="name" />
							<Input label="Description" size="lg" name="description" />
							<input hidden ref={inputRef} name="file" type="file" onChange={handleFileChange} />
							{!file && <Button onPress={handleClick}>Select File</Button>}
						</form>
						{file && (
							<div className="flex flex-row gap-2 rounded-xl bg-gray-100 p-3 align-middle">
								<p className="my-auto truncate">{file.name}</p>
								<Button className="ml-auto" isIconOnly onPress={() => setFile()} color="danger">
									<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" size={24} />
								</Button>
								<Button
									isIconOnly
									isDisabled={!(file.type.includes("image") || file.type.includes("pdf"))}
									onPress={() => {
										setViewFile(true);
										setInitialIsHidden(isHidden);
										setIsHidden(true);
									}}>
									<SolarIconSet.Eye iconStyle="Outline" size={24} />
								</Button>
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button form="main" type="submit">
							Save
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<Modal
				onOpenChange={() => {
					setViewFile(false);
					setIsHidden(initialIsHidden);
				}}
				size="3xl"
				className="!z-[1000] h-[90vh]"
				isOpen={(searchParams.has("add") || searchParams.has("edit")) && status === "authenticated" && authorize(session, [s.management]) && fileUrl && viewFile}>
				<ModalContent className="z-[1000] overflow-y-auto" position="right" size="content">
					<ModalHeader>View File</ModalHeader>
					<ModalBody>
						<iframe className="h-full" src={fileUrl}></iframe>
					</ModalBody>
					<ModalFooter>
						<Button
							onPress={() => {
								setViewFile(false);
								setIsHidden(initialIsHidden);
							}}
							color="danger">
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}

export function DeleteModal() {
	const { data: session, status } = useSession();

	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	async function deleteCommitteeHandler() {
		const res = await deleteCommittee(committeeId);
		if (res) toast(res);
		if (res.ok) {
			removeSearchParams({ add: "", edit: "", delete: "" }, router);
			router.refresh();
		}
	}

	return (
		<Modal isOpen={searchParams.has("delete") && status === "authenticated" && authorize(session, [s.management])} onOpenChange={() => removeSearchParams({ add: "", edit: "", delete: "" }, router)}>
			<ModalContent>
				<ModalHeader>Delete Files</ModalHeader>
				<ModalBody>Are you sure you want to delete the file?</ModalBody>
				<ModalFooter>
					<Button color="danger" onPress="">
						Delete
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
