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

export default function AddRolesModal({ schools, committees, departments, selectedUsers, sessions }) {
	const { data: session, status } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [selectedRole, setSelectedRole] = useState("delegate");

	async function addRolehandler(formData) {
		flushSync(() => {
			setIsLoading(true);
		});
		formData.append(
			"users",
			selectedUsers.map(({ user }) => user.id)
		);
		const res = await addRole(formData);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res?.ok) {
			removeSearchParams({ assign: "", selected: "", remove: "" }, router);
			router.refresh();
		}
	}

	useEffect(() => {
		setIsOpen(searchParams.has("assign") && status === "authenticated" && authorize(session, [s.management]));
	}, [searchParams, status, session]);

	return (
		<Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={() => removeSearchParams({ assign: "" }, router)}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">Assign Roles</ModalHeader>
				<ModalBody>
					<Table aria-label="Example static collection table">
						<TableHeader>
							<TableColumn>NAME</TableColumn>
							<TableColumn>CURRENT ROLE</TableColumn>
						</TableHeader>
						<TableBody>
							{selectedUsers.map(({ user }, currentRoles) => {
								return (
									<TableRow key={user.id}>
										<TableCell>{user.officialName + " " + user.officialSurname}</TableCell>
										<TableCell>{currentRoles[0]?.name || "No Roles Assigned"}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
					{selectedUsers.length > 2 && <p className="px-3 text-sm">Select 2 or less users to be able to assign roles with a high rank.</p>}
					{selectedUsers.length > 1 && <p className="px-3 text-sm">Select a single user to be able to assign Admin Roles.</p>}
					<form id="main" className="flex flex-col gap-4" action={addRolehandler}>
						<Select isRequired name="roleName" disallowEmptySelection selectedKeys={[selectedRole]} onChange={(e) => setSelectedRole(e.target.value)} label="Role">
							<SelectItem key="delegate">Delegate</SelectItem>
							{!(selectedUsers.length > 2) && <SelectItem key="chair"> Chair</SelectItem>}
							<SelectItem key="member">Member</SelectItem>
							{!(selectedUsers.length > 2) && <SelectItem key="manager">Manager</SelectItem>}
							{!(selectedUsers.length > 2) && <SelectItem key="schoolDirector">School Director</SelectItem>}
							{!(selectedUsers.length > 2) && <SelectItem key="deputyPresidentOfTheGeneralAssembly">Deputy President of the General Assembly</SelectItem>}
							{!(selectedUsers.length > 2) && <SelectItem key="deputySecretaryGeneral">Deputy Secretary-General</SelectItem>}
							{!(selectedUsers.length > 1) && <SelectItem key="presidentOfTheGeneralAssembly">President of the General Assembly</SelectItem>}
							{!(selectedUsers.length > 1) && <SelectItem key="secretaryGeneral">Secretary-General</SelectItem>}
							{!(selectedUsers.length > 1) && <SelectItem key="director">Director</SelectItem>}
							{!(selectedUsers.length > 1) && <SelectItem key="seniorDirector">Senior Director</SelectItem>}
							{!(selectedUsers.length > 1) && <SelectItem key="admin">Admin</SelectItem>}
							{!(selectedUsers.length > 1) && <SelectItem key="globalAdmin"> Global Admin</SelectItem>}
						</Select>

						{!["globalAdmin", "admin", "seniorDirector", "director"].includes(selectedRole) && (
							<Select
								isRequired
								name="sessionId"
								onSelectionChange={(e) => {
									updateSearchParams({ assign: [...e] });
								}}
								items={sessions}
								label="Session">
								{(session) => (
									<SelectItem textValue={"Session " + session.number} key={session.id}>
										{session.number}
										<sup>{getOrdinal(session.number)}</sup> Annual Session
									</SelectItem>
								)}
							</Select>
						)}
						{["delegate", "chair"].includes(selectedRole) && (
							<Select isRequired name="committeeId" items={committees} label="Committee">
								{(committee) => <SelectItem key={committee.id}>{committee.name}</SelectItem>}
							</Select>
						)}
						{["member", "manager"].includes(selectedRole) && (
							<Select isRequired name="departmentId" items={departments} label="Department">
								{(department) => <SelectItem key={department.id}>{department.name}</SelectItem>}
							</Select>
						)}
						{selectedRole == "delegate" && (
							<Select name="country" items={countries} label="Country">
								{(country) => (
									<SelectItem startContent={<Avatar alt="Flag" className="h-6 w-6" src={`https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`} />} key={country.countryCode}>
										{country.countryNameEn}
									</SelectItem>
								)}
							</Select>
						)}
						{selectedRole == "member" && <Textarea label="Job Description" name="jobDescription" maxLength={256} />}
						{selectedRole == "schoolDirector" && (
							<Select isRequired name="schoolId" items={schools} label="School">
								{(school) => <SelectItem key={school.id}>{school.name}</SelectItem>}
							</Select>
						)}
					</form>
				</ModalBody>
				<ModalFooter>
					<Button onPress={() => removeSearchParams({ assign: "" }, router)} color="danger" variant="light">
						Close
					</Button>
					<Button form="main" type="submit" color="primary">
						Add Role
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
