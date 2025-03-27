"use client";

import { useSelectedContext } from "./StateStateProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateSearchParams } from "@/lib/search-params";
import { toggleDisableOrEnableUsers } from "../../../@userModals/actions";
import { Badge } from "@/components/badge";
import { Avatar } from "@heroui/avatar";
import { CircleCheck } from "lucide-react";

export function UserChip({ uid, officialName, displayName }) {
	const { setSelected } = useSelectedContext();
	function onClickHandler() {
		setSelected((prev) => prev.filter((item) => item.id !== uid));
	}

	return (
		<Badge className="cursor-pointer hover:bg-primary hover:text-white hover:line-through" onClick={onClickHandler} key={uid}>
			<Avatar showFallback className="my-auto h-4 w-4 bg-primary text-white shadow-md" src={`/api/users/${uid}/avatar`} />
			{displayName || officialName}
		</Badge>
	);
}

export function SelectedUsersWindow({ customEmptyText = "Select users to access bulk actions.", selectAll }: { customEmptyText?: string; selectAll?: object[] }) {
	const router = useRouter();
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
		const selectedString = selected.map((user) => user.id).join(",");
		updateSearchParams({ "assign-roles": selectedString }, router);
		router.refresh();
	}

	function handleSelectAll() {
		setSelected(selectAll);
		const selectedString = selected.map((user) => user.id).join(",");
		updateSearchParams({ "select-all": selectedString }, router);
		router.refresh();
	}

	return (
		<>
			<div className="rounded-lg bg-zinc-100 p-4">
				<div className="flex">
					<div className="flex-shrink-0">
						<CircleCheck aria-hidden="true" className="h-5 w-5 text-zinc-400" />
					</div>
					<div className="ml-3 overflow-x-scroll">
						<h3 className="text-sm font-medium text-zinc-800">{!!selected.length ? "Select Users" : customEmptyText}</h3>
						{!!selected.length && (
							<div className="flex-warp mt-2 flex gap-2 text-sm text-zinc-700">
								<p>{selected.length} users selected</p>
							</div>
						)}
						{!!selected.length && (
							<div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-700">
								{selected.map((user, index) => {
									return <UserChip key={index} uid={user.id} officialName={user.officialName} displayName={user.displayName} />;
								})}
							</div>
						)}
						{!!selected.length ? (
							<div className="mt-4">
								<div className="max-w-auto -mx-2 -my-1.5 flex">
									<button
										disabled={!selected.length}
										type="button"
										onClick={onDeselectAllClickHandler}
										className="min-w-max rounded-md bg-zinc-100 px-2 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
										Deselect All
									</button>
									<button
										onClick={onAssignRolesClickHandler}
										type="button"
										disabled={!selected.length}
										className="ml-3 min-w-max rounded-md bg-zinc-100 px-2 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
										Assign Roles
									</button>
									<button
										onClick={() => handleDisableOrEnableAll(true)}
										type="button"
										disabled={!selected.length}
										className="min-w-max rounded-md bg-zinc-100 px-2 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
										Disable{!!(selected.length - 1) && " All"}
									</button>
									<button
										onClick={() => handleDisableOrEnableAll(false)}
										type="button"
										disabled={!selected.length}
										className="ml-3 min-w-max rounded-md bg-zinc-100 px-2 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
										Enable{!!(selected.length - 1) && " All"}
									</button>
								</div>
							</div>
						) : (
							!!selectAll?.length && (
								<div className="mt-4">
									<div className="max-w-auto -mx-2 -my-1.5 flex">
										<button
											onClick={handleSelectAll}
											type="button"
											disabled={!!selected.length || !selectAll?.length}
											className="min-w-max rounded-md bg-zinc-100 text-primary px-2 py-1.5 text-sm font-medium hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
											Select All On Page
										</button>
									</div>
								</div>
							)
						)}
					</div>
				</div>
			</div>
		</>
	);
}
