"use client";

import Icon from "@/components/icon";
import { updateSearchParams } from "@/lib/search-params";
import { Button, ButtonGroup } from "@nextui-org/button";
import { useRouter } from "next/navigation";

export function EditRolesButton({ userId }) {
	const router = useRouter();
	function onEditClickHandler() {
		updateSearchParams({ edituser: userId }, router);
		router.refresh();
	}
	function onRolesClickHandler() {
		updateSearchParams({ assignroles: userId }, router);
		router.refresh();
	}
	function onDeleteRolesClickHandler() {
		updateSearchParams({ "edit-roles": userId }, router);
		router.refresh();
	}

	return (
		<ButtonGroup>
			<Button
				onPress={onEditClickHandler}
				isIconOnly
				className="h-10 w-10 min-w-10 -translate-x-1 -translate-y-1 bg-background p-0 text-default-500"
				radius="full"
				size="sm"
				variant="bordered">
				<Icon className="h-[18px] w-[18px]" icon="solar:pen-linear" />
			</Button>
			<Button
				onPress={onRolesClickHandler}
				isIconOnly
				className="h-10 w-10 min-w-10 -translate-x-1 -translate-y-1 border-l-1 bg-background p-0 text-default-500"
				radius="full"
				size="sm"
				variant="bordered">
				<Icon className="h-[22px] w-[22px]" icon="solar:bag-3-outline" />
			</Button>
			<Button
				onPress={onDeleteRolesClickHandler}
				isIconOnly
				className="h-10 w-10 min-w-10 -translate-x-1 -translate-y-1 border-l-1 bg-background p-0 text-default-500"
				radius="full"
				size="sm"
				variant="bordered">
				<Icon className="h-[20px] w-[20px]" icon="solar:bag-cross-outline" />
			</Button>
		</ButtonGroup>
	);
}
