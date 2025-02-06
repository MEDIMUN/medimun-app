"use client";

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Ellipsis } from "lucide-react";
import { removeCoSubmitter, removeCoSubmitterInvitation } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SearchParamsDropDropdownItem } from "@/app/(medibook)/medibook/client-components";

export function EditCoSubmitter({ selectedResolution, coSubmitter }) {
	const router = useRouter();
	return (
		<Dropdown>
			<DropdownButton plain>
				<Ellipsis />
			</DropdownButton>
			<DropdownMenu>
				<DropdownItem
					onClick={async () => {
						if (coSubmitter?.type === "CO_SUBMITTER") {
							const res = await removeCoSubmitter(selectedResolution.id, coSubmitter.delegateId);
							if (res?.ok) {
								toast.success(res?.message, {
									id: "delete-resource",
								});
								router.refresh();
							} else {
								toast.error(res?.message, {
									id: "delete-resource",
								});
							}
						} else {
							const res = await removeCoSubmitterInvitation(selectedResolution.id, coSubmitter.delegateId);
							if (res?.ok) {
								toast.success(res?.message, {
									id: "delete-resource",
								});
								router.refresh();
							} else {
								toast.error(res?.message, {
									id: "delete-resource",
								});
							}
						}
					}}>
					Delete
				</DropdownItem>
				<SearchParamsDropDropdownItem searchParams={{ "transfer-main-submitter": selectedResolution.id, "co-submitter-id": coSubmitter.delegate.id }}>
					Make Main Submitter
				</SearchParamsDropDropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}
