"use client";

import { drawerProps } from "@/data/constants";
import { cn } from "@/lib/cn";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Input } from "@nextui-org/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/modal";
import { Select, SelectItem, SelectSection } from "@nextui-org/select";
import { useSearchParams } from "next/navigation";
import { createRollCall, deleteRollCall } from "./actions";
import { useState } from "react";
import { toast } from "sonner";
import { flushSync as flush } from "react-dom";
import { removeSearchParams } from "@/lib/searchParams";
import { useRouter } from "next/navigation";

export function RollCallModal({ conferenceDays, edit, workshopDays, className, ...others }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function handleRollCallHandler(formData: FormData) {
		flush(() => setIsLoading(true));
		formData.append("id", searchParams.get("edit"));
		const res = await createRollCall(formData);
		if (res?.ok) {
			removeSearchParams({ add: "", edit: "" }, router);
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	return (
		<Modal
			{...drawerProps}
			title="Roll Call"
			isOpen={searchParams.has("add") || searchParams.has("edit")}
			onClose={() => removeSearchParams({ [searchParams.has("add") ? "add" : "edit"]: "" }, router)}>
			<ModalContent>
				<ModalHeader>{searchParams.has("add") ? "Add" : "Edit"} Roll Call</ModalHeader>
				<ModalBody as="form" id="main" action={handleRollCallHandler}>
					<Input defaultValue={edit?.name} isRequired maxLength={20} name="name" size="lg" label="Name" />
					<Select
						isRequired
						name="dayId"
						size="lg"
						{...others}
						label="Day"
						disallowEmptySelection
						defaultSelectedKeys={[searchParams.get("day")]}
						className={cn("min-w-min", className)}>
						{!!conferenceDays.length && (
							<SelectSection title="Conference Days">
								{conferenceDays.map((day) => (
									<SelectItem key={day.id} textValue={day.name || day.title} aria-label={day.name || day.title}>
										<div key={day.id} className="flex">
											{day.name || day.title}
											<Chip size="sm" className="ml-auto h-5 bg-primary text-white">
												{day.date.toLocaleString().slice(0, 10)}
											</Chip>
										</div>
									</SelectItem>
								))}
							</SelectSection>
						)}
						{!!workshopDays.length && (
							<SelectSection title="Workshop Days">
								{workshopDays.map((day) => (
									<SelectItem key={day.id} textValue={day.name || day.title} aria-label={day.name || day.title}>
										<div key={day.id} className="flex">
											{day.name || day.name}
											<Chip size="sm" className="ml-auto h-5 bg-primary text-white">
												{day.date.toLocaleString().slice(0, 10)}
											</Chip>
										</div>
									</SelectItem>
								))}
							</SelectSection>
						)}
					</Select>
				</ModalBody>
				<ModalFooter>
					<Button onPress={() => removeSearchParams({ [searchParams.has("add") ? "add" : "edit"]: "" }, router)} color="primary" variant="light">
						Cancel
					</Button>
					<Button isLoading={isLoading} type="submit" form="main" color="primary" onClick={() => {}}>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

//deletemodal with password

export function DeleteModal({ rcId, ...others }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function handleDeleteHandler(formData) {
		flush(() => setIsLoading(true));
		formData.append("id", searchParams.get("delete"));
		const res = await deleteRollCall(formData);
		if (res?.ok) {
			toast.success(res?.message);
			removeSearchParams({ delete: "" }, router);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	return (
		<Modal {...drawerProps} title="Delete Roll Call" isOpen={searchParams.has("delete")} onClose={() => removeSearchParams({ delete: "" }, router)}>
			<ModalContent>
				<ModalHeader>Delete Roll Call</ModalHeader>
				<ModalBody as="form" id="main" action={handleDeleteHandler}>
					<p className="text-sm">
						Deleting this roll call is irreversible. Registers taken for this roll call will be lost. Please enter your password to confirm the
						deletion.
					</p>
					<Input isRequired maxLength={35} name="password" size="lg" type="password" label="Password" />
				</ModalBody>
				<ModalFooter>
					<Button onPress={() => removeSearchParams({ delete: "" }, router)} color="primary" variant="light">
						Cancel
					</Button>
					<Button isLoading={isLoading} type="submit" form="main" color="danger">
						Delete
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
