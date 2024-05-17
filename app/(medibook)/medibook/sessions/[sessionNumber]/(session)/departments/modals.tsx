"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addDepartment, deleteDepartment } from "./actions";
import { Textarea } from "@nextui-org/react";
import { Modal, ModalContent, AvatarGroup, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Input, Button, ButtonGroup } from "@nextui-org/react";
import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { SlugInput } from "@/components/slugInput";
import { drawerProps } from "@/constants";

export default function Drawer({ edit, sessionNumber }) {
	const { data: session, status } = useSession();

	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	async function addDepartmentHandler(formData) {
		formData.append("sessionNumber", sessionNumber);
		formData.append("departmentId", searchParams.get("edit"));
		const res = await addDepartment(formData);
		if (res) toast(res);
		if (res?.ok) {
			removeSearchParams({ add: "", edit: "", delete: "" }, router);
			router.refresh();
		}
	}

	const toInputUppercase = (e) => {
		e.target.value = ("" + e.target.value).toUpperCase();
	};

	return (
		<Modal {...drawerProps} isOpen={(searchParams.has("add") || searchParams.has("edit")) && status === "authenticated" && authorize(session, [s.management])} onOpenChange={() => removeSearchParams({ add: "", edit: "" }, router)}>
			<ModalContent>
				<ModalHeader>{searchParams.has("add") ? "Add Department" : `Edit ${edit?.name}`}</ModalHeader>
				<ModalBody as="form" action={addDepartmentHandler} id="main">
					<Input defaultValue={edit?.name} size="lg" label="Department Name" isRequired name="name" />
					<Input onInput={toInputUppercase} defaultValue={edit?.shortName} maxLength={3} size="lg" label="Short Name" name="shortName" />
					<Select defaultSelectedKeys={[edit?.type]} isRequired size="lg" label="Department Type" name="departmentType">
						<SelectItem key="MEDINEWS">MediNews</SelectItem>
						<SelectItem key="APPROVALPANEL">Approval Panel</SelectItem>
						<SelectItem key="IT">IT</SelectItem>
						<SelectItem key="SALES">Sales</SelectItem>
						<SelectItem key="PREP">Preparations</SelectItem>
						<SelectItem key="ADMINSTAFF">Admin Staff</SelectItem>
						<SelectItem key="OTHER">Other</SelectItem>
					</Select>
					<SlugInput defaultValue={edit?.slug} label="Link Slug" size="lg" name="slug" />
					<Textarea defaultValue={edit?.description} size="lg" label="Description" name="description" maxLength={200} minLength={10} />
				</ModalBody>
				<ModalFooter>
					<Button color="danger" variant="light" onPress={() => removeSearchParams({ add: "", edit: "", delete: "" }, router)}>
						Close
					</Button>
					<Button onPress={() => updateSearchParams({ delete: searchParams.get("edit") }, router)} color="danger">
						Delete Department
					</Button>
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
			removeSearchParams({ add: "", delete: "", edit: "" }, router);
			router.refresh();
		}
	}

	return (
		<Modal {...drawerProps} isOpen={searchParams.has("delete") && status === "authenticated" && authorize(session, [s.management])} onOpenChange={() => removeSearchParams({ add: "", delete: "" }, router)}>
			<ModalContent>
				<ModalHeader>Delete Department</ModalHeader>
				<ModalBody>Are you sure you want to delete the department? This action is irreversible.</ModalBody>
				<ModalFooter>
					<Button color="danger" variant="light" onPress={() => removeSearchParams({ delete: "" }, router)}>
						Cancel
					</Button>
					<Button color="danger" onPress={deleteDepartmentHandler}>
						Delete
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
