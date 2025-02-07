"use client";

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Ellipsis } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SearchParamsDropDropdownItem } from "@/app/(medibook)/medibook/client-components";
import { removeAllianceMemberInvitation, removeDelegateFromAlliance } from "../../../@allianceModals/action";

export function EditAllianceMember({ selectedAlliance, allianceMember }) {
	const router = useRouter();
	if (!allianceMember) return null;
	return (
		<Dropdown>
			<DropdownButton plain>
				<Ellipsis />
			</DropdownButton>
			<DropdownMenu>
				<DropdownItem
					onClick={async () => {
						if (allianceMember?.type === "CO_SUBMITTER") {
							const res = await removeDelegateFromAlliance({
								allianceId: selectedAlliance.id,
								delegateId: allianceMember.delegateId,
							});
							if (res?.ok) {
								toast.success(res?.message, {
									id: "main",
								});
								router.refresh();
							} else {
								toast.error(res?.message, {
									id: "main",
								});
							}
						} else {
							const res = await removeAllianceMemberInvitation({
								allianceId: selectedAlliance.id,
								delegateId: allianceMember.delegateId,
							});
							if (res?.ok) {
								toast.success(res?.message, {
									id: "main",
								});
								router.refresh();
							} else {
								toast.error(res?.message, {
									id: "main",
								});
							}
						}
					}}>
					Remove
				</DropdownItem>
				<SearchParamsDropDropdownItem searchParams={{ "transfer-alliance-owner": selectedAlliance.id, "delegate-id": allianceMember.delegate.id }}>Make Alliance Owner</SearchParamsDropDropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}
