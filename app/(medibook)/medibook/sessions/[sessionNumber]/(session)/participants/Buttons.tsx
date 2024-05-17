"use client";

import { Button } from "@nextui-org/button";
import Icon from "@/components/icon";
import { startTransition, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSearchParams } from "@/lib/searchParams";
import { toast } from "sonner";
import { flushSync } from "react-dom";

export function MoveUpButton({ index, length, id }) {
	const [pending, startTransition] = useTransition();
	const router = useRouter();
	async function moveUpHandler() {
		startTransition(async () => {
			await moveUp(id);
			router.refresh();
		});
	}
	return (
		<Button onPress={moveUpHandler} isDisabled={index == 0 || pending} isIconOnly fullWidth className="-border-small w-auto border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10">
			<Icon className="" icon="solar:arrow-up-outline" width={20} />
		</Button>
	);
}

export function MoveDownButton({ index, length, id }) {
	const [pending, startTransition] = useTransition();
	const router = useRouter();
	async function moveDownHandler() {
		startTransition(async () => {
			await moveDown(id);
			router.refresh();
		});
	}
	return (
		<Button onPress={moveDownHandler} isDisabled={index + 1 == length || pending} isIconOnly fullWidth className={`-border-small w-auto border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10 ${index !== 0 && "border-l-0"}`}>
			<Icon className="" icon="solar:arrow-down-outline" width={20} />
		</Button>
	);
}

export function DeleteButton({ id }) {
	const router = useRouter();
	return <Button isIconOnly onPress={() => updateSearchParams({ delete: id }, router)} endContent={<Icon className="" icon="solar:trash-bin-trash-outline" width={22} />} fullWidth className="-border-small w-auto border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10"></Button>;
}

export function EditButton({ id }) {
	const router = useRouter();
	function editFaqHandler() {
		updateSearchParams({ edit: id }, router);
	}

	return <Button onPress={editFaqHandler} isIconOnly endContent={<Icon className="" icon="solar:pen-new-square-outline" width={22} />} fullWidth className="-border-small w-auto border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10"></Button>;
}

export function AnswersButton({ id }) {
	const router = useRouter();
	function editAnswersHandler() {
		updateSearchParams({ answers: id }, router);
	}

	return <Button onPress={editAnswersHandler} isIconOnly endContent={<Icon className="" icon="solar:question-circle-outline" width={22} />} fullWidth className="-border-small w-auto border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10"></Button>;
}
