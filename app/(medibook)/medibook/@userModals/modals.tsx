"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { InformationCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { roleRanks } from "@/data/constants";

import { editUser, addRole, removeRole, unafilliateStudent, createUser, deleteUser } from "./actions";

import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import formatDateForInput from "@/lib/formatDateForInput";
import { authorize, authorizeChairDelegate, authorizeManagerMember, authorizeSchoolDirectorStudent, s } from "@/lib/authorize";
import { getOrdinal } from "@/lib/ordinal";
import { romanize } from "@/lib/romanize";

import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { SlugInput } from "@/components/slugInput";
import { countries } from "@/data/countries";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Avatar } from "@nextui-org/avatar";
import { generateUserData } from "@/lib/user";
import { ProfileUploader } from "../(global)/users/components/ProfilePictureFrame";

export function AssignUserChip({ uid, officialName, displayName }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	function onClickHandler() {
		const userIdsArray = searchParams.get("assignroles").split(",");
		const newUsersArray = userIdsArray.filter((id) => id !== uid);
		if (!newUsersArray.length) {
			removeSearchParams({ assignroles: "" }, router);
			router.refresh();
		} else {
			updateSearchParams({ assignroles: newUsersArray.join(",") }, router);
			router.refresh();
		}
	}

	return (
		<div
			onClick={onClickHandler}
			key={uid}
			className="flex cursor-pointer select-none justify-center gap-1 rounded-lg p-1 pl-1 pr-2 align-middle text-sm shadow-sm ring-1 ring-zinc-300 duration-200 hover:bg-primary hover:text-white hover:line-through">
			<Avatar size="sm" showFallback radius="none" className="my-auto h-5 w-5 rounded-md shadow-md" src={`/api/users/${uid}/avatar`} />
			<p className="my-auto">{displayName || officialName}</p>
		</div>
	);
}

export function DeleteRoleButton({ role, userID }) {
	const router = useRouter();

	async function onClickHandler() {
		const res = await removeRole(role, userID);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
	}
	return (
		<button
			onClick={onClickHandler}
			type="button"
			className="inline-flex rounded-md bg-zinc-50 p-1.5 text-zinc-500 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
			<span className="sr-only">Delete Role</span>
			<XMarkIcon aria-hidden="true" className="h-5 w-5" />
		</button>
	);
}

export function EditUserModal({ edit, schools, studentSchoolId }) {
	const { data: authSession, status } = useSession();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function createUserHandler(formData) {
		flushSync(() => setIsLoading(true));
		formData.append("id", edit?.id);
		const res = await editUser(formData);
		if (res) toast(res?.message);
		if (res?.ok) {
			removeSearchParams({ "edit-user": "", "add-user": "" }, router);
			router.refresh();
		}
		setIsLoading(false);
	}

	const onClose = () => removeSearchParams({ "edit-user": "", adduser: "" });

	if (status !== "authenticated") return null;

	const isManagerOfMember = authorizeManagerMember(authSession.user.currentRoles, edit?.currentRoles);
	const isChairOfDelegate = authorizeChairDelegate(authSession.user.currentRoles, edit?.currentRoles);
	const isManagement = authorize(authSession, [s.management]);
	const isDirectorOfStudent = authorizeSchoolDirectorStudent(authSession.user.currentRoles, { schoolId: studentSchoolId });

	const generalEdit = isManagement || isChairOfDelegate || isManagerOfMember;

	const allUpdatableFields = [
		"id",
		"officialName",
		"officialSurname",
		"nationality",
		"dateOfBirth",
		isManagement && "email",
		isManagement && "schoolId",
		isManagement && "isDisabled",
		generalEdit && "displayName",
		generalEdit && "username",
		generalEdit && "phoneNumber",
		generalEdit && "gender",
		generalEdit && "pronouns",
		generalEdit && "bio",
		generalEdit && "isProfilePrivate",
	];

	const isOpen =
		(edit?.id &&
			!!searchParams.get("edit-user") &&
			status === "authenticated" &&
			(isManagement || isChairOfDelegate || isManagerOfMember || isDirectorOfStudent)) ||
		false;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Edit User</DialogTitle>
			<DialogBody>
				<form className="flex flex-col gap-6" id="main" action={createUserHandler}>
					<ProfileUploader user={edit} />

					{allUpdatableFields.includes("email") && (
						<Field className="flex flex-col gap-3">
							<Label>Email</Label>
							<Input maxLength={50} required type="email" name="email" defaultValue={edit?.email} />
						</Field>
					)}

					{allUpdatableFields.includes("officialName") && (
						<Field className="flex flex-col gap-3">
							<Label>Official Name</Label>
							<Input maxLength={50} required type="text" name="officialName" defaultValue={edit?.officialName} />
						</Field>
					)}

					{allUpdatableFields.includes("officialSurname") && (
						<Field className="flex flex-col gap-3">
							<Label>Official Surname</Label>
							<Input maxLength={50} required type="text" name="officialSurname" defaultValue={edit?.officialSurname} />
						</Field>
					)}

					{allUpdatableFields.includes("displayName") && (
						<Field className="flex flex-col gap-3">
							<Label>Display Name</Label>
							<Input maxLength={50} type="text" name="displayName" defaultValue={edit?.displayName} />
						</Field>
					)}

					{allUpdatableFields.includes("dateOfBirth") && (
						<Field className="flex flex-col gap-3">
							<Label>Date of Birth</Label>
							<Input type="date" name="dateOfBirth" defaultValue={formatDateForInput(edit?.dateOfBirth)} />
						</Field>
					)}

					{allUpdatableFields.includes("schoolId") && (
						<Field className="flex flex-col">
							<Label>School</Label>
							<Select defaultValue={edit?.schoolId} name="schoolId">
								<option value="null">None</option>
								{schools?.map((school) => (
									<option key={school?.id} value={school?.id}>
										{school?.name}
									</option>
								))}
							</Select>
						</Field>
					)}

					{allUpdatableFields.includes("username") && (
						<Field className="flex flex-col">
							<Label>Username</Label>
							<SlugInput separator="_" defaultValue={edit?.username} name="username" />
						</Field>
					)}

					{allUpdatableFields.includes("phoneNumber") && (
						<Field className="flex flex-col gap-3">
							<Label>Phone Number</Label>
							<Input defaultValue={edit?.phoneNumber} maxLength={30} name="phoneNumber" />
						</Field>
					)}

					{allUpdatableFields.includes("nationality") && (
						<Field className="flex flex-col">
							<Label>Nationality</Label>
							<Select defaultValue={edit?.nationality} name="nationality" placeholder="Country">
								<option value="null">None</option>
								{countries.map((country) => (
									<option key={country.countryCode} value={country.countryCode}>
										{country.countryNameEn}
									</option>
								))}
							</Select>
						</Field>
					)}

					{allUpdatableFields.includes("isProfilePrivate") && (
						<Field className="flex flex-col">
							<Label>Profile Visibility</Label>
							<Select defaultValue={[edit?.isProfilePrivate ? "true" : "false"]} name="isProfilePrivate">
								<option value="false">Public</option>
								<option value="true">Private</option>
							</Select>
						</Field>
					)}

					{allUpdatableFields.includes("isDisabled") && (
						<Field className="flex flex-col">
							<Label>Account Status</Label>
							<Select defaultValue={[edit?.isDisabled ? "true" : "false"]} name="isDisabled">
								<option value="false">Enabled</option>
								<option value="true">Disabled</option>
							</Select>
						</Field>
					)}

					{allUpdatableFields.includes("gender") && (
						<Field className="flex flex-col">
							<Label>Gender</Label>
							<Select name="gender" defaultValue={[edit?.gender || null]}>
								<option value="FEMALE">Female</option>
								<option value="MALE">Male</option>
								<option value="NONBINARY">Non-Binary</option>
								<option value="OTHER">Other</option>
								<option value="PREFERNOTTOANSWER">Prefer not to Answer</option>
							</Select>
						</Field>
					)}

					{allUpdatableFields.includes("pronouns") && (
						<Field className="flex flex-col gap-3">
							<Label>Pronouns</Label>
							<Input defaultValue={edit?.pronouns} placeholder="Separate with slashes" type="text" name="pronouns" maxLength={50} />
						</Field>
					)}

					{allUpdatableFields.includes("bio") && (
						<Field className="flex flex-col gap-1">
							<Label>Biography</Label>
							<Textarea defaultValue={edit?.bio} maxLength={500} name="bio" />
						</Field>
					)}
				</form>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose}>
					Close
				</Button>

				<Button disabled={isLoading} form="main" type="submit">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function AddRolesModal({ schools, committees, departments, selectedUsers, sessions }) {
	const { data: authSession, status } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const selectedRole = searchParams.get("role") || "delegate";
	const isManagement = authorize(authSession, [s.management]);

	async function addRolehandler(formData) {
		flushSync(() => {
			setIsLoading(true);
		});
		const res = await addRole(
			formData,
			selectedUsers.map((user) => user.id)
		);
		if (res?.ok) {
			toast.success(res?.message);
			removeSearchParams({ "assign-roles": "", selected: "", remove: "", role: "" }, router);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	function onClose() {
		removeSearchParams({ "assign-roles": "", session: "" });
	}

	const session = searchParams.get("session");
	const committee = searchParams.get("committee");
	const department = searchParams.get("department");
	const role = searchParams.get("role");

	useEffect(() => {
		router.refresh();
	}, [session, committee, department, role, router]);

	const onlyOneUser = selectedUsers?.length === 1;

	const roles = [
		{ value: "delegate", label: "Delegate", disabled: false },
		{ value: "chair", label: "Chair", disabled: selectedUsers?.length > 1 },
		{ value: "member", label: "Member", disabled: false },
		{ value: "manager", label: "Manager", disabled: selectedUsers?.length > 2 },
		{ value: "schoolDirector", label: "School Director", disabled: selectedUsers?.length > 2 },
		{ value: "deputyPresidentOfTheGeneralAssembly", label: "Deputy President of the General Assembly", disabled: selectedUsers?.length > 2 },
		{ value: "deputySecretaryGeneral", label: "Deputy Secretary-General", disabled: selectedUsers?.length > 2 },
		{ value: "presidentOfTheGeneralAssembly", label: "President of the General Assembly", disabled: selectedUsers?.length > 1 },
		{ value: "secretaryGeneral", label: "Secretary-General", disabled: selectedUsers?.length > 1 },
		{ value: "director", label: "Director", disabled: selectedUsers?.length > 1 },
		{ value: "seniorDirector", label: "Senior Director", disabled: selectedUsers?.length > 1 },
		{ value: "admin", label: "Admin", disabled: selectedUsers?.length > 1 },
		{ value: "globalAdmin", label: "Global Admin", disabled: selectedUsers?.length > 1 },
	];

	const isOpen = !!searchParams.get("assign-roles") && selectedUsers.length > 0 && status === "authenticated" && isManagement;
	const numberOfUsers = selectedUsers?.length;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Assign Roles{onlyOneUser && ` to ${selectedUsers[0].displayName || selectedUsers[0].officialName}`}</DialogTitle>
			<DialogDescription>Roles define what a user can or can&apos;t do.</DialogDescription>
			<DialogBody>
				{(selectedUsers?.length > 2 || selectedUsers?.length > 1) && (
					<div className="mb-6 flex flex-col gap-2">
						{selectedUsers?.length > 2 && (
							<div className="rounded-md bg-zinc-50 p-2">
								<div className="flex">
									<div className="flex-shrink-0">
										<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
									</div>
									<div className="ml-3 flex-1 md:flex md:justify-between">
										<p className="text-sm text-zinc-700">Select 2 or less users to assign more powerful roles.</p>
									</div>
								</div>
							</div>
						)}

						{selectedUsers?.length > 1 && (
							<div className="rounded-md bg-zinc-50 p-2">
								<div className="flex">
									<div className="flex-shrink-0">
										<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
									</div>
									<div className="ml-3 flex-1 md:flex md:justify-between">
										<p className="text-sm text-zinc-700">Select a single user to be able to assign Admin Roles.</p>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* @ts-ignore Server Action */}
				<form className="flex flex-col gap-5" id="main" action={addRolehandler}>
					{!onlyOneUser && (
						<div className="mb-1 flex flex-wrap gap-2">
							{selectedUsers.map((user) => (
								<AssignUserChip key={user.id} uid={user.id} officialName={user.officialName} displayName={user.displayName} />
							))}
						</div>
					)}

					<Field>
						<Label>Role</Label>
						<Listbox name="roleName" defaultValue={[searchParams.get("role")]} onChange={(e) => updateSearchParams({ role: e })}>
							{roles.map((role) => (
								<ListboxOption value={role.value} key={role.value} disabled={role.disabled}>
									<ListboxLabel>{role.label}</ListboxLabel>
								</ListboxOption>
							))}
						</Listbox>
					</Field>

					{!["globalAdmin", "admin", "seniorDirector", "director"].includes(selectedRole) && (
						<Field>
							<Label>Session</Label>
							<Listbox name="sessionId" onChange={(val) => updateSearchParams({ session: val }, router)} defaultValue={[searchParams.get("session")]}>
								{sessions?.map((s) => {
									return (
										<ListboxOption key={s.id} value={s.id}>
											<ListboxLabel>
												{s.number}
												<sup>{getOrdinal(s.number)}</sup> Annual Session
											</ListboxLabel>
										</ListboxOption>
									);
								})}
							</Listbox>
						</Field>
					)}

					{["delegate", "chair"].includes(selectedRole) && (
						<Field>
							<Label>Committee</Label>
							<Listbox disabled={!committees?.length} name="committeeId">
								{committees?.map((c) => (
									<ListboxOption value={c.id} key={c.id}>
										<ListboxLabel>{c.name}</ListboxLabel>
									</ListboxOption>
								))}
							</Listbox>
						</Field>
					)}

					{["member", "manager"].includes(selectedRole) && (
						<Field>
							<Label>Department</Label>
							<Listbox disabled={!departments?.length} name="departmentId">
								{departments?.map((d) => (
									<ListboxOption value={d.id} key={d.id}>
										<ListboxLabel>{d.name}</ListboxLabel>
									</ListboxOption>
								))}
							</Listbox>
						</Field>
					)}

					{selectedRole == "delegate" && (
						<Field>
							<Label>Country or Entity</Label>
							<Listbox name="country">
								{countries.map((c) => (
									<ListboxOption value={c.countryCode} key={c.countryCode}>
										<ListboxLabel>{c.countryNameEn}</ListboxLabel>
									</ListboxOption>
								))}
							</Listbox>
						</Field>
					)}

					{selectedRole == "schoolDirector" && (
						<Field>
							<Label>School</Label>
							<Listbox name="schoolId">
								{schools.map((s) => (
									<ListboxOption value={s.id} key={s.id}>
										<ListboxLabel>{s.name}</ListboxLabel>
									</ListboxOption>
								))}
							</Listbox>
						</Field>
					)}
				</form>
			</DialogBody>

			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>

				<Button disabled={isLoading} form="main" type="submit">
					Assign role to {numberOfUsers} user{numberOfUsers > 1 && "s"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function EditRolesModal({ selectedUser, highestRoleRank }) {
	//FIX
	const searchParams = useSearchParams();
	const { data: authSession, status } = useSession();

	function handleOnClose() {
		removeSearchParams({ "edit-roles": "" });
	}

	const allRoles = selectedUser?.currentRoles.concat(selectedUser?.pastRoles);

	const fullName = selectedUser?.displayName || `${selectedUser?.officialName} ${selectedUser?.officialSurname}`;
	const isOpen: boolean = !!searchParams.get("edit-roles") && authorize(authSession, [s.management]);

	if (status !== "authenticated") return null;

	return (
		<Dialog open={isOpen} onClose={handleOnClose}>
			<DialogTitle>Edit Roles</DialogTitle>
			<DialogDescription>
				Roles define what a user can do, have access to and what they can&apos;t do. Some changes may take a few minutes to take effect.
			</DialogDescription>
			<DialogBody>
				{!allRoles?.length && (
					<div className="rounded-md bg-red-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">{fullName} has no roles assigned to them.</h3>
							</div>
						</div>
					</div>
				)}
				<ul className="flex flex-col gap-2">
					{allRoles?.map((role) => {
						const rank = roleRanks[role?.name];
						return (
							<>
								<div className="rounded-md bg-zinc-50 p-4">
									<div className="flex">
										<div className="">
											<p className="text-sm font-medium text-zinc-800">
												<b>{role.name}</b> {(role.department || role.committee || role.school) && "of"}{" "}
												{role.department || role.committee || role.school}
												{rank <= 3 && (
													<Badge color="red" className="ml-1">
														Highly Priviliged Role
													</Badge>
												)}
												{rank <= 5 && rank > 3 && (
													<Badge color="yellow" className="ml-1">
														Secretariat Role
													</Badge>
												)}
											</p>
											<div className="mt-2 text-sm text-zinc-700">
												<p>
													{role.session ? `Session ${romanize(role?.session)}` : "All Sessions"} • Power Rank {rank}/9
												</p>
											</div>
										</div>
										<div className="my-auto ml-auto pl-3">
											<div className="-mx-1.5 -my-1.5">
												<DeleteRoleButton role={role} userID={selectedUser.id} />
											</div>
										</div>
									</div>
								</div>
							</>
						);
					})}
				</ul>
			</DialogBody>
			<DialogActions>
				<Button onClick={handleOnClose}>Cancel</Button>
			</DialogActions>
		</Dialog>
	);
}

export function UnafilliateStudentModal({ fullName, userId }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: authSession } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	async function handleUnafilliateUser() {
		flushSync(() => setIsLoading(true));
		const res = await unafilliateStudent(userId);
		if (res) toast(res?.message);
		if (res?.ok) {
			removeSearchParams({ "edit-user": "", adduser: "", "unafilliate-student": "" }, router);
			router.refresh();
		}
		setIsLoading(false);
	}

	const handleOnClose = () => removeSearchParams({ "unafilliate-student": "" });
	const isOpen: boolean = !!searchParams.get("unafilliate-student") && authorize(authSession, [s.schooldirector]);

	return (
		<Dialog open={isOpen} onClose={handleOnClose}>
			<DialogTitle>Unafilliate User From School</DialogTitle>
			<DialogDescription>Unafilliate {fullName} from your school. You will no longer be able to manage this user.</DialogDescription>
			<DialogActions>
				<Button plain disabled={isLoading} onClick={handleOnClose}>
					Cancel
				</Button>
				<Button disabled={isLoading} color="red" onClick={handleUnafilliateUser}>
					Unafilliate Student
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function CreateUserModal({ schools }) {
	const { data: authSession, status } = useSession();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function createUserHandler(formData: FormData) {
		flushSync(() => setIsLoading(true));
		const res = await createUser(formData);
		if (res?.ok) {
			toast.success(...res?.message);
			removeSearchParams({ "create-user": "", "edit-user": "" }, router);
			router.refresh();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const onClose = () => removeSearchParams({ "create-user": "", "edit-user": "" });

	if (status !== "authenticated") return null;
	const isManagement = authorize(authSession, [s.management]);
	const isOpen = !!searchParams.get("create-user") && status === "authenticated" && isManagement;

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Add User</DialogTitle>
			<DialogBody as="form" id="create-user" className="flex flex-col gap-6" action={createUserHandler}>
				<Field>
					<Label>
						Email <Badge color="red">Required</Badge>
					</Label>
					<Input maxLength={50} required type="email" name="email" />
				</Field>

				<Field>
					<Label>
						Official Name <Badge color="red">Required</Badge>
					</Label>
					<Description>As per official documents</Description>
					<Input maxLength={50} required type="text" name="officialName" />
				</Field>

				<Field>
					<Label>
						Official Surname <Badge color="red">Required</Badge>
					</Label>
					<Description>As per official documents</Description>
					<Input maxLength={50} required type="text" name="officialSurname" />
				</Field>

				<Field>
					<Label>Display Name</Label>
					<Description>How the user will be displayed to others, this should include the surname.</Description>
					<Input maxLength={50} type="text" name="displayName" />
				</Field>

				<Field>
					<Label>Date of Birth</Label>
					<Input type="date" name="dateOfBirth" />
				</Field>

				<Field>
					<Label>School</Label>
					<Select name="schoolId">
						<option value="null">None</option>
						{schools?.map((school) => (
							<option key={school?.id} value={school?.id}>
								{school?.name}
							</option>
						))}
					</Select>
				</Field>

				<Field>
					<Label>Username</Label>
					<SlugInput separator="_" name="username" />
				</Field>

				<Field>
					<Label>Phone Number</Label>
					<Description>Include country code</Description>
					<Input maxLength={30} name="phoneNumber" />
				</Field>

				<Field>
					<Label>Nationality</Label>
					<Select name="nationality">
						<option value="null">None</option>
						{countries.map((country) => (
							<option key={country.countryCode} value={country.countryCode}>
								{country.countryNameEn}
							</option>
						))}
					</Select>
				</Field>

				<Field>
					<Label>Profile Visibility</Label>
					<Select name="isProfilePrivate">
						<option value="false">Public</option>
						<option value="true">Private</option>
					</Select>
				</Field>

				<Field>
					<Label>Account Status</Label>
					<Select name="isDisabled">
						<option value="false">Enabled</option>
						<option value="true">Disabled</option>
					</Select>
				</Field>

				<Field>
					<Label>Gender</Label>
					<Select name="gender">
						<option value="FEMALE">Female</option>
						<option value="MALE">Male</option>
						<option value="NONBINARY">Non-Binary</option>
						<option value="OTHER">Other</option>
						<option value="PREFERNOTTOANSWER">Prefer not to Answer</option>
					</Select>
				</Field>

				<Field>
					<Label>Pronouns</Label>
					<Input placeholder="Separate with slashes" type="text" name="pronouns" maxLength={50} />
				</Field>

				<Field>
					<Label>Biography</Label>
					<Textarea maxLength={500} name="bio" />
				</Field>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose}>
					Close
				</Button>
				<Button disabled={isLoading} form="create-user" type="submit">
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function DeleteUserModal({ selectedUser }) {
	const { data: authSession, status } = useSession();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function deleteUserHandler() {
		if (isLoading) return;
		flushSync(() => setIsLoading(true));
		const res = await deleteUser(selectedUser.id);
		if (res?.ok) {
			toast.success(...res?.message);
			removeSearchParams({ "create-user": "", "edit-user": "" }, router);
			router.refresh();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const onClose = () => removeSearchParams({ "create-user": "", "edit-user": "", "delete-user": "" });

	if (status !== "authenticated") return null;
	const isManagement = authorize(authSession, [s.management]);
	const isOpen = !!searchParams.get("delete-user") && status === "authenticated" && isManagement && !!selectedUser;

	if (isOpen)
		return (
			<Dialog open={isOpen} onClose={onClose}>
				<DialogTitle>
					Delete {selectedUser.officialName} {selectedUser.officialSurname}?
				</DialogTitle>
				<DialogDescription>Deleting this user will remove all their data and they will no longer be able to access the platform.</DialogDescription>
				<DialogActions>
					<Button plain disabled={isLoading} onClick={onClose}>
						Close
					</Button>
					<Button loading={isLoading} color="red" disabled={isLoading} onClick={deleteUserHandler}>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		);
}
