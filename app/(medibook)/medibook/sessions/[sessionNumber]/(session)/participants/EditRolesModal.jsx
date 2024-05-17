"use client";

import { Input, Button, Textarea, Autocomplete, Dropdown, DropdownTrigger, DropdownMenu, Select, SelectSection, SelectItem, DropdownItem, AutocompleteItem, Avatar, Modal, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow, ButtonGroup } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { countries } from "@/data/countries";
import { flushSync } from "react-dom";
import Link from "next/link";
import { addRole } from "./actions";
import { getOrdinal } from "@/lib/get-ordinal";
import { updateSearchParams, removeSearchParams } from "@/lib/searchParams";
import * as SolarIconSet from "solar-icon-set";
import { removeRole } from "./actions";

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
		setIsOpen(searchParams.has("remove") && status === "authenticated" && AllRoles.length > 0 && authorize(session, [s.management]));
	}, [searchParams, status, session]);
	return (
		<Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={() => removeSearchParams({ remove: "" }, router)}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">Edit User Roles</ModalHeader>
				<ModalBody>
					<Table isStriped aria-label="Example static collection table">
						<TableHeader>
							<TableColumn>ROLE</TableColumn>
							<TableColumn>INFO</TableColumn>
							<TableColumn>SESSION</TableColumn>
							<TableColumn>DELETE</TableColumn>
						</TableHeader>
						<TableBody emptyContent="No Roles Found">
							{AllRoles.map((role) => {
								return (
									<TableRow key={Math.random()}>
										<TableCell>{role.name}</TableCell>
										<TableCell>{role.committee || role.department}</TableCell>
										<TableCell>{role.session || "All"}</TableCell>
										<TableCell>
											<ButtonGroup>
												<Button onPress={() => removeRoleHandler(role, user)} isIconOnly color="danger">
													<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" size={24} />
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
