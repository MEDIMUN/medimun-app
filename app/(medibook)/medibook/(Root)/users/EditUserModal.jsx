"use client";
import { Input, Button, Textarea, Autocomplete, AutocompleteItem, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow, ButtonGroup, Select, SelectSection, SelectItem } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addUser } from "./add-user.server";
import { countries } from "@/data/countries";
import { flushSync } from "react-dom";
import Link from "next/link";
import { removeSearchParams } from "@/lib/searchParams";
import ManagementProfileUploader from "./ProfilePictureFrame";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table";

export default function Component({ users, schools }) {
	const { data: session, status } = useSession();
	const [isOpen, setIsOpen] = useState(false);

	const searchParams = useSearchParams();
	const edit = users.find((user) => user.id == searchParams.get("edit"));
	const [isLoading, setIsLoading] = useState(false);

	const [schoolId, setSchoolId] = useState("");
	const [nationality, setNationality] = useState("");
	const [phoneCode, setPhoneCode] = useState("");
	const [username, setUsername] = useState("");
	const [officialName, setOfficialName] = useState("");
	const [officialSurname, setOfficialSurname] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [dateOfBirth, setDateOfBirth] = useState("");

	const router = useRouter();
	const { toast } = useToast();

	async function createUserHandler(formData) {
		flushSync(() => {
			setIsLoading(true);
		});
		formData.append("nationality", nationality);
		formData.append("username", username);
		formData.append("phoneCode", phoneCode);
		formData.append("schoolId", schoolId);
		const res = await addUser(formData);
		if (res) toast(res);
		if (res?.ok) {
			setUsername("");
			setPhoneCode("");
			setSchoolId("");
			router.push(`/medibook/users`);
			router.refresh();
		}
		setIsLoading(false);
	}

	function nameCase(name) {
		const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

		const capitalized = name
			.replace(/[^a-zA-Z-' ]/g, "")
			.split(/\s|-/)
			.map(capitalize)
			.join(" ")
			.replace(/-/g, " - ");

		return capitalized;
	}

	useEffect(() => {
		setIsOpen((searchParams.get("add") == "" || searchParams.has("edit") || searchParams.has("view")) && status === "authenticated" && authorize(session, [s.management]));
		setSchoolId(edit?.student?.school?.id || ""); ////FIX
		setNationality(edit?.nationality || "");
		setUsername(edit?.username || "");
		setOfficialName(edit?.officialName || "");
		setOfficialSurname(edit?.officialSurname || "");
		setDisplayName(edit?.displayName || "");
		setEmail(edit?.email || "");
		setPhoneNumber(edit?.phoneNumber || "");
		setPhoneCode(edit?.phoneCode || "");
		setDateOfBirth(edit?.dateOfBirth?.toISOString().substring(0, 10) || "");
	}, [searchParams, status, session]);

	if (searchParams.get("add") == "" || searchParams.has("edit")) {
		return (
			<Modal
				scrollBehavior="inside"
				isOpen={isOpen}
				size="2xl"
				onOpenChange={() => {
					if (searchParams.get("return")) {
						router.push(searchParams.get("return"));
					} else {
						removeSearchParams({ edit: "", view: "", add: "" }, router);
					}
				}}>
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">{searchParams.has("add") ? "Add a User" : "Edit User"}</ModalHeader>
					<ModalBody>
						{!searchParams.has("add") && <ManagementProfileUploader user={edit} />}
						<form action={createUserHandler} id="main" name="main" className="flex flex-col gap-4 py-4">
							{!searchParams.has("add") && <Input size="lg" color="danger" isReadOnly startContent="#" defaultValue={edit?.id} label="User ID (Can't be modified)" name="id" />}
							<Input
								size="lg"
								color="danger"
								isRequired
								onChange={(e) => {
									let email = e.target.value
										.trim()
										.toLowerCase()
										.replace(/[^a-zA-Z0-9._@-]/g, "")
										.replace(/\s/g, "");
									setEmail(email);
								}}
								onKeyDown={(e) => {
									if (e.key === " ") {
										e.preventDefault();
									}
								}}
								value={email}
								label="Email Address"
								type="email"
								minLength={2}
								maxLength={64}
								name="email"
							/>
							<Input
								size="lg"
								onChange={(e) => {
									setOfficialName(nameCase(e.target.value));
								}}
								value={officialName}
								label="Official Name"
								isRequired
								type="text"
								minLength={2}
								maxLength={64}
								name="officialName"
							/>
							<Input
								size="lg"
								onChange={(e) => {
									setOfficialSurname(nameCase(e.target.value));
								}}
								value={officialSurname}
								label="Official Surname"
								isRequired
								type="text"
								minLength={2}
								maxLength={64}
								name="officialSurname"
							/>
							<Input
								size="lg"
								onChange={(e) => {
									setDisplayName(nameCase(e.target.value));
								}}
								value={displayName}
								label="Preferred Name"
								type="text"
								minLength={2}
								maxLength={64}
								name="displayName"
							/>
							<Autocomplete size="lg" defaultSelectedKey={schoolId} onSelectionChange={setSchoolId} defaultItems={schools} label="School">
								{(school) => <AutocompleteItem key={school.id}>{school.name}</AutocompleteItem>}
							</Autocomplete>
							<ButtonGroup className="gap-4">
								<Select color="" size="lg" defaultSelectedKeys={[phoneCode]} onChange={(e) => setPhoneCode(e.target.value)} label="Code" items={countries}>
									{(country) => (
										<SelectItem startContent={<Avatar alt="Flag" className="h-6 w-6" src={`https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`} />} key={country.countryCode}>
											{"+" + country.countryCallingCode + " (" + country.countryNameEn + ")"}
										</SelectItem>
									)}
								</Select>
								<Input size="lg" onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} value={phoneNumber} label="Number" minLength={5} maxLength={100} name="phoneNumber" />
							</ButtonGroup>
							<Input size="lg" defaultValue={edit?.dateOfBirth?.toISOString().substring(0, 10)} label="Date of Birth" placeholder=" " type="date" minLength={2} maxLength={64} name="dateOfBirth" />
							<Select size="lg" defaultSelectedKeys={[edit?.nationality || null]} onChange={(e) => setNationality(e.target.value)} items={countries} label="Nationality">
								{(country) => (
									<SelectItem startContent={<Avatar alt="Flag" className="h-6 w-6" src={`https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`} />} key={country.countryCode}>
										{country.countryNameEn}
									</SelectItem>
								)}
							</Select>
							<Input
								startContent="@"
								size="lg"
								label="Username"
								value={username}
								onChange={(e) =>
									setUsername(
										e.target.value
											.replace(" ", "_")
											.replace("__", "_")
											.replace(/[^a-zA-Z0-9_]/g, "")
											.toLowerCase()
									)
								}
								maxLength={32}
								name="username"
							/>
							{!searchParams.has("add") && (
								<>
									<Select defaultSelectedKeys={[edit?.allowProfilePictureUpdate ? "true" : "false"]} size="lg" name="allowProfilePictureUpdate" label="Allowed Profile Picture update">
										<SelectItem key="true">Yes</SelectItem>
										<SelectItem key="false">No</SelectItem>
									</Select>
									<Select defaultSelectedKeys={[edit?.allowBioUpdate ? "true" : "false"]} size="lg" name="allowBioUpdate" label="Allowed Biography update">
										<SelectItem key="true">Yes</SelectItem>
										<SelectItem key="false">No</SelectItem>
									</Select>
									<Select defaultSelectedKeys={[edit?.isProfilePrivate ? "true" : "false"]} size="lg" name="isProfilePrivate" label="Profile Visibility">
										<SelectItem key="false">Public</SelectItem>
										<SelectItem key="true">Private</SelectItem>
									</Select>
								</>
							)}
							<Select size="lg" defaultSelectedKeys={[edit?.gender || null]} name="gender" label="Gender">
								<SelectItem value="FEMALE" key="FEMALE">
									Female
								</SelectItem>
								<SelectItem value="MALE" key="MALE">
									Male
								</SelectItem>
								<SelectItem value="NONBINARY" key="NONBINARY">
									Non-Binary
								</SelectItem>
								<SelectItem value="OTHER" key="OTHER">
									Other
								</SelectItem>
								<SelectItem value="PREFERNOTTOANSWER" key="PREFERNOTTOANSWER">
									Prefer not to Answer
								</SelectItem>
							</Select>
							<ButtonGroup className="gap-4">
								<Input size="lg" defaultValue={edit?.pronoun1} label="Pronoun 1" type="text" minLength={2} maxLength={4} name="pronoun1" />
								<Input size="lg" defaultValue={edit?.pronoun2} label="Pronoun 2" type="text" minLength={2} maxLength={4} name="pronoun2" />
							</ButtonGroup>
							<Textarea size="lg" defaultValue={edit?.bio} label="Biography" maxLength={512} name="bio" />
						</form>
					</ModalBody>
					<ModalFooter>
						<Button isDisabled={isLoading} isLoading={isLoading} form="main" type="submit">
							Save
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		);
	}
}
