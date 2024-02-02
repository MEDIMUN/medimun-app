"use client";
import { Label } from "@/components/ui/label";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addDepartment, deleteDepartment } from "./add-department.server";
import { Textarea } from "@nextui-org/react";
import { RadioGroup, Radio } from "@nextui-org/react";
import { Modal, ModalContent, AvatarGroup, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Input, Button, ButtonGroup } from "@nextui-org/react";
import { removeSearchParams } from "@/lib/searchParams";

export default function Drawer({ edit, sessionNumber }) {
	const { data: session, status } = useSession();

	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	const [slug, setSlug] = useState(edit?.slug || null);

	async function addDepartmentHandler(formData) {
		formData.append("sessionNumber", sessionNumber);
		formData.append("departmentId", searchParams.get("edit"));
		const res = await addDepartment(formData);
		if (res) toast(res);
		if (res?.ok) {
			removeSearchParams(router, { add: "", edit: "", delete: "" });
			router.refresh();
		}
	}

	function handleSlugChange(e) {
		setSlug(
			e.target.value
				.replace(" ", "-")
				.replace(/[^a-zA-Z0-9-]/g, "")
				.toLowerCase()
				.replace(/-+/g, "-")
				.replace(/^-/, "")
				.trim()
				.slice(0, 32)
		);
	}

	function onSlugBlur(e) {
		if (slug.endsWith("-")) {
			setSlug(slug.slice(0, -1));
		}
	}

	useEffect(() => {
		if (edit?.slug) setSlug(edit.slug);
		if (!edit?.slug) setSlug("");
	}, [edit, searchParams]);

	const toInputUppercase = (e) => {
		e.target.value = ("" + e.target.value).toUpperCase();
	};

	return (
		<Modal isOpen={(searchParams.has("add") || searchParams.has("edit")) && status === "authenticated" && authorize(session, [s.management])} onOpenChange={() => removeSearchParams(router, { add: "", edit: "" })}>
			<ModalContent className="overflow-y-auto" position="right" size="content">
				<ModalHeader>Add Department to Session {sessionNumber}</ModalHeader>
				<ModalBody>
					<form action={addDepartmentHandler} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
						<Input defaultValue={edit?.name} size="lg" label="Department Name" isRequired name="name" />
						<Input onInput={toInputUppercase} defaultValue={edit?.shortName} maxLength={3} size="lg" label="Short Name" name="shortName" />
						<Select defaultSelectedKeys={[edit?.type]} isRequired size="lg" label="Department Type" name="departmentType">
							<SelectItem key="MEDINEWS">MediNews</SelectItem>
							<SelectItem key="APPROVALPANEL">Approval Panel</SelectItem>
							<SelectItem key="SALES">Sales</SelectItem>
							<SelectItem key="PREP">Preparations</SelectItem>
							<SelectItem key="ADMINSTAFF">Admin Staff</SelectItem>
							<SelectItem key="OTHER">Other</SelectItem>
						</Select>
						<Input defaultValue={edit?.slug} label="Link Slug" size="lg" value={slug} onChange={handleSlugChange} onBlur={onSlugBlur} name="slug" maxLength={30} minLength={2} />
						<Textarea defaultValue={edit?.description} size="lg" label="Description" name="description" maxLength={200} minLength={10} />
					</form>
				</ModalBody>
				<ModalFooter>
					<Button form="main" type="submit">
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export function DeleteModal() {
	const { data: session, status } = useSession();

	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	async function deleteDepartmentHandler() {
		const departmentId = searchParams.get("delete");
		const res = await deleteDepartment(departmentId);
		if (res) toast(res);
		if (res.ok) {
			removeSearchParams(router, { add: "", edit: "", delete: "" });
			router.refresh();
		}
	}

	return (
		<Modal isOpen={searchParams.has("delete") && status === "authenticated" && authorize(session, [s.management])} onOpenChange={() => removeSearchParams(router, { add: "", edit: "", delete: "" })}>
			<ModalContent>
				<ModalHeader>Delete Department</ModalHeader>
				<ModalBody>Are you sure you want to delete the department? This action is irreversible.</ModalBody>
				<ModalFooter>
					<Button color="danger" onPress={deleteDepartmentHandler}>
						Delete
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
