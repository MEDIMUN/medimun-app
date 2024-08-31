"use client";

import Icon from "@/components/icon";
import { updateSearchParams } from "@/lib/searchParams";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { deleteRollCall, moveRollCallDown, moveRollCallUp } from "./actions";
import { useState } from "react";
import { toast } from "sonner";
import { useScreenSizeClass } from "@/hooks/use-screen-size-class";

export function EditButton({ rcId, ...others }) {
	const screenclass = useScreenSizeClass();
	const router = useRouter();
	function handleOnPress() {
		updateSearchParams({ edit: rcId }, router);
	}
	return (
		<Button {...others} onPress={handleOnPress} className="w-full border-r" isIconOnly={screenclass !== "sm"}>
			<Icon icon="solar:pen-outline" width={20} />
		</Button>
	);
}

export function MoveUpButton({ rcId, ...others }) {
	const screenclass = useScreenSizeClass();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	async function handleOnPress() {
		setIsLoading(true);
		const res = await moveRollCallUp(rcId);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}
	return (
		<Button {...others} isLoading={isLoading} onPress={handleOnPress} className="w-full border-r-1" isIconOnly={screenclass !== "sm"}>
			<Icon icon="solar:arrow-up-outline" width={20} />
		</Button>
	);
}

export function MoveDownButton({ rcId, ...others }) {
	const screenclass = useScreenSizeClass();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	async function handleOnPress() {
		setIsLoading(true);
		const res = await moveRollCallDown(rcId);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}
	return (
		<Button {...others} isLoading={isLoading} className="w-full border-r-1" onPress={handleOnPress} isIconOnly={screenclass !== "sm"}>
			<Icon icon="solar:arrow-down-outline" width={20} />
		</Button>
	);
}

export function DeleteButton({ rcId, ...others }) {
	const screenclass = useScreenSizeClass();
	const router = useRouter();
	async function handleOnPress() {
		updateSearchParams({ delete: rcId }, router);
	}
	return (
		<Button {...others} onPress={handleOnPress} className="w-full" isIconOnly={screenclass !== "sm"}>
			<Icon icon="solar:trash-bin-minimalistic-outline" width={20} />
		</Button>
	);
}
