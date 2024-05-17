"use client";

import { Input, Button, Textarea, Autocomplete, Dropdown, DropdownTrigger, DropdownMenu, Select, SelectSection, SelectItem, DropdownItem, AutocompleteItem, Avatar, Modal, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow, ButtonGroup } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { countries } from "@/data/countries";
import Link from "next/link";
import { addRole } from "./user.server";
import { getOrdinal } from "@/lib/get-ordinal";
import { updateSearchParams, removeSearchParams } from "@/lib/searchParams";
import * as SolarIconSet from "solar-icon-set";
import { removeRole } from "./user.server";
import { romanize } from "@/lib/romanize";

export default function EditRolesModal({ user }) {
	const { data: session, status } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const { toast } = useToast();

	const currentRoles = user ? user.currentRoles : [];
	const pastRoles = user ? user.pastRoles : [];
	const AllRoles = [...currentRoles, ...pastRoles];

	async function removeRoleHandler(role, user) {
		const res = await removeRole(role, user);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res?.ok) {
			router.refresh();
		}
	}

	useEffect(() => {
		setIsOpen(searchParams.has("remove") && status === "authenticated" /* && AllRoles.length > 0 */ && authorize(session, [s.management]));
	}, [searchParams, status, session]);
	return (
		<Modal disableAnimation size="xl" scrollBehavior="inside" isOpen={isOpen} onOpenChange={() => removeSearchParams({ remove: "" }, router)}>
			<ModalContent>
				<ModalHeader>Edit User Roles</ModalHeader>
				<ModalBody>
					<Table removeWrapper hideHeader isStriped>
						<TableHeader>
							<TableColumn>ROLE</TableColumn>
							<TableColumn>INFO</TableColumn>
							<TableColumn>SESSION</TableColumn>
							<TableColumn>DELETE</TableColumn>
						</TableHeader>
						<TableBody emptyContent="No Roles Assigned">
							{AllRoles.map((role) => {
								return (
									<TableRow key={Math.random()}>
										<TableCell>{role.name}</TableCell>
										<TableCell>{role.committee || role.department}</TableCell>
										<TableCell>{role.session ? "Session " + romanize(role.session) : "All"}</TableCell>
										<TableCell>
											<ButtonGroup>
												<Button onPress={() => removeRoleHandler(role, user)} isIconOnly color="">
													<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" color="#F21260" size={24} />
												</Button>
											</ButtonGroup>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</ModalBody>
				<ModalFooter>
					<Button onPress={() => removeSearchParams({ remove: "" }, router)} color="danger" variant="light">
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
