"use client";

import { use } from "react";
import { useSelectedContext } from "./StateStateProvider";
import { UserChip } from "./UserChip";
import { maxNoOfSelected } from "../page";
import { toast } from "sonner";
import { toggleDisableOrEnableUsers } from "../actions";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/button";
import { updateSearchParams } from "@/lib/searchParams";
import { Divider } from "@/components/divider";

export function SelectedUsersWindow() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { selected, setSelected } = useSelectedContext();

	async function handleDisableOrEnableAll(isEnable) {
		const selectedUsers = selected.map((user) => user.id);
		const res = await toggleDisableOrEnableUsers(selectedUsers, isEnable);
		if (res) {
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
	}

	function onDeselectAllClickHandler() {
		setSelected([]);
	}

	function onAssignRolesClickHandler() {
		const selectedString = selected.map((user) => user.id).join("U");
		updateSearchParams({ assignroles: selectedString }, router);
		router.refresh();
	}

	return (
		<div className="mb-6 flex w-full flex-col gap-3 overflow-hidden text-sm/6">
			<div className="flex font-medium text-zinc-500 dark:text-zinc-400">
				<p className="-mb-1">Selected Users</p>
				<p className="ml-auto">
					{selected.length} / {maxNoOfSelected}
				</p>
			</div>
			<Divider className="w-full" />
			<div className="flex min-h-7 flex-wrap gap-2">
				{selected.map((user) => {
					return <UserChip uid={user.id} officialName={user.officialName} displayName={user.displayName} />;
				})}
				{!selected.length && <p className="my-auto text-sm">No users selected</p>}
			</div>
			<div className="grid grid-cols-2 gap-2 md:mr-auto md:grid-cols-4 md:flex-row">
				<Button disabled={!selected.length} className="md:h-8" color="light" onClick={onDeselectAllClickHandler}>
					Deselect All
				</Button>
				<Button disabled={!selected.length} className="md:h-8" color="light" onClick={onAssignRolesClickHandler}>
					Assign Roles
				</Button>
				<Button disabled={!selected.length} className="md:h-8" color="light" onClick={() => handleDisableOrEnableAll(true)}>
					Disable{!!(selected.length - 1) && " All"}
				</Button>
				<Button disabled={!selected.length} className="md:h-8" color="light" onClick={() => handleDisableOrEnableAll(false)}>
					Enable{!!(selected.length - 1) && " All"}
				</Button>
			</div>
		</div>
	);
}
