"use client";

import { use } from "react";
import { useSelectedContext } from "./StateStateProvider";
import { UserChip } from "./UserChip";
import { maxNoOfSelected } from "../page";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/button";
import { updateSearchParams } from "@/lib/searchParams";
import { Divider } from "@/components/divider";
import { toggleDisableOrEnableUsers } from "../../../@userModals/actions";
import { CheckCircleIcon } from "@heroicons/react/16/solid";

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
		<>
			<div className="mb-10 rounded-md bg-zinc-50 p-4">
				<div className="flex">
					<div className="flex-shrink-0">
						<CheckCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
					</div>
					<div className="ml-3 overflow-x-scroll">
						<h3 className="text-sm font-medium text-zinc-800">{!!selected.length ? "Select Users" : "Select users to access bulk actions."}</h3>
						{!!selected.length && (
							<div className="flex-warp mt-2 flex gap-2 text-sm text-zinc-700">
								<p>{selected.length} users selected</p>
							</div>
						)}
						{!!selected.length && (
							<div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-700">
								{selected.map((user) => {
									return <UserChip uid={user.id} officialName={user.officialName} displayName={user.displayName} />;
								})}
							</div>
						)}
						{!!selected.length && (
							<div className="mt-4">
								<div className="max-w-auto -mx-2 -my-1.5 flex">
									<button
										disabled={!selected.length}
										type="button"
										onClick={onDeselectAllClickHandler}
										className="min-w-max rounded-md bg-zinc-50 px-2 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
										Deselect All
									</button>
									<button
										onClick={onAssignRolesClickHandler}
										type="button"
										disabled={!selected.length}
										className="ml-3 min-w-max rounded-md bg-zinc-50 px-2 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
										Assign Roles
									</button>
									<button
										onClick={() => handleDisableOrEnableAll(true)}
										type="button"
										disabled={!selected.length}
										className="min-w-max rounded-md bg-zinc-50 px-2 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
										Disable{!!(selected.length - 1) && " All"}
									</button>
									<button
										onClick={() => handleDisableOrEnableAll(false)}
										type="button"
										disabled={!selected.length}
										className="ml-3 min-w-max rounded-md bg-zinc-50 px-2 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
										Enable{!!(selected.length - 1) && " All"}
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
