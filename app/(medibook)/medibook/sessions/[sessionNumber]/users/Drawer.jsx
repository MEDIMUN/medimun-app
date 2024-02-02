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

export default function Drawer({ users, schools }) {
	const { data: session, status } = useSession();
	const [isOpen, setIsOpen] = useState(false);

	const searchParams = useSearchParams();
	const edit = users.find((user) => user.id == searchParams.get("edit"));
	const view = users.find((user) => user.id == searchParams.get("view"));
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
		setSchoolId(edit?.student[0]?.school.id || "");
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
				onOpenChange={() => {
					if (searchParams.get("return")) {
						router.push(searchParams.get("return"));
					} else {
						removeSearchParams(router, { edit: "", view: "", add: "" });
					}
				}}>
				<ModalContent className="overflow-y-auto" position="right" size="content">
					<ModalHeader className="flex flex-col gap-1">{searchParams.has("add") ? "Add a User" : "Edit User"}</ModalHeader>
					<ModalBody>
						{!searchParams.has("add") && <ManagementProfileUploader user={edit} />}
						<form action={createUserHandler} id="main" name="main" className="flex flex-col gap-4 py-4">
							{!searchParams.has("add") && <Input size="lg" color="danger" isReadOnly startContent="#" defaultValue={edit?.id} label="User ID (Can't be modified)" name="id" placeholder=" " labelPlacement="outside" />}
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
								placeholder=" "
								labelPlacement="outside"
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
								placeholder=" "
								isRequired
								labelPlacement="outside"
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
								placeholder=" "
								isRequired
								labelPlacement="outside"
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
								placeholder=" "
								labelPlacement="outside"
								type="text"
								minLength={2}
								maxLength={64}
								name="displayName"
							/>
							<Autocomplete size="lg" defaultSelectedKey={schoolId} onSelectionChange={setSchoolId} placeholder=" " labelPlacement="outside" defaultItems={schools} label="School">
								{(school) => <AutocompleteItem key={school.id}>{school.name}</AutocompleteItem>}
							</Autocomplete>
							<ButtonGroup className="gap-2">
								<Select size="lg" defaultSelectedKeys={[phoneCode]} onChange={(e) => setPhoneCode(e.target.value)} placeholder=" " labelPlacement="outside" items={countries} label="Code">
									{(country) => (
										<SelectItem startContent={<Avatar alt="Flag" className="h-6 w-6" src={`https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`} />} key={country.countryCode}>
											{"+" + country.countryCallingCode + " (" + country.countryNameEn + ")"}
										</SelectItem>
									)}
								</Select>
								<Input size="lg" onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} value={phoneNumber} label="Number" labelPlacement="outside" placeholder=" " minLength={5} maxLength={100} name="phoneNumber" />
							</ButtonGroup>
							<Input size="lg" defaultValue={edit?.dateOfBirth?.toISOString().substring(0, 10)} label="Date of Birth" placeholder=" " labelPlacement="outside" type="date" minLength={2} maxLength={64} name="dateOfBirth" />
							<Select size="lg" defaultSelectedKeys={[edit?.nationality || null]} onChange={(e) => setNationality(e.target.value)} placeholder=" " labelPlacement="outside" items={countries} label="Nationality">
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
								labelPlacement="outside"
								placeholder=" "
							/>
							{!searchParams.has("add") && (
								<>
									<Select defaultSelectedKeys={[edit?.allowProfilePictureUpdate ? "true" : "false"]} labelPlacement="outside" placeholder=" " size="lg" name="allowProfilePictureUpdate" label="Allowed Profile Picture update">
										<SelectItem key="true">Yes</SelectItem>
										<SelectItem key="false">No</SelectItem>
									</Select>
									<Select defaultSelectedKeys={[edit?.allowBioUpdate ? "true" : "false"]} labelPlacement="outside" placeholder=" " size="lg" name="allowBioUpdate" label="Allowed Biography update">
										<SelectItem key="true">Yes</SelectItem>
										<SelectItem key="false">No</SelectItem>
									</Select>
									<Select defaultSelectedKeys={[edit?.isProfilePrivate ? "true" : "false"]} labelPlacement="outside" placeholder=" " size="lg" name="isProfilePrivate" label="Profile Visibility">
										<SelectItem key="false">Public</SelectItem>
										<SelectItem key="true">Private</SelectItem>
									</Select>
								</>
							)}
							<Select size="lg" defaultSelectedKeys={[edit?.gender || null]} labelPlacement="outside" name="gender" placeholder=" " label="Gender">
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
							<ButtonGroup className="gap-2">
								<Input size="lg" defaultValue={edit?.pronoun1} label="Pronoun 1" placeholder=" " labelPlacement="outside" type="text" minLength={2} maxLength={4} name="pronoun1" />
								<Input size="lg" defaultValue={edit?.pronoun2} label="Pronoun 2" placeholder=" " labelPlacement="outside" type="text" minLength={2} maxLength={4} name="pronoun2" />
							</ButtonGroup>
							<Textarea size="lg" defaultValue={edit?.bio} label="Biography" maxLength={512} name="bio" labelPlacement="outside" placeholder=" " />
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

	if (searchParams.get("view"))
		return (
			<Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={() => router.push(searchParams.get("return") || "/medibook/users")}>
				<ModalContent className="overflow-y-auto" position="right" size="content">
					<ModalHeader className="flex flex-col gap-1">Details of {view?.officialName}</ModalHeader>
					<ModalBody>
						<div>
							<p>User ID</p>
							<strong>{view?.id}</strong>
						</div>
						<div>
							<p>Official Name</p>
							<strong>{view?.officialName}</strong>
						</div>
						{view?.officialSurname && (
							<div>
								<p>Official Surname</p>
								<strong>{view?.officialSurname}</strong>
							</div>
						)}
						{view?.displayName && (
							<div>
								<p>Display Name</p>
								<strong>{view?.displayName}</strong>
							</div>
						)}
						{view?.email && (
							<div>
								<p>Email Address</p>
								<strong>{view?.email}</strong>
							</div>
						)}
						{view?.phoneNumber && (
							<div>
								<p>Phone Number</p>
								<p>{phoneCode}</p>
								<strong>{"+" + countries.find((c) => c.countryCode == view.phoneCode)?.countryCallingCode + " " + view?.phoneNumber}</strong>
							</div>
						)}
						{view?.dateOfBirth && (
							<div>
								<p>Date of Birth</p>
								<strong>{view?.dateOfBirth.toISOString().substring(0, 10)}</strong>
							</div>
						)}
						<div className="flex gap-2">
							{view?.pronoun1 && (
								<div>
									<p>Pronouns</p>
									<strong>
										{view?.pronoun1}
										{view?.pronoun2 && "/"}
										{view?.pronoun2}
									</strong>
								</div>
							)}
						</div>
						<div>
							<p>Profile Privacy</p>
							<strong>{view?.isProfilePrivate ? "Private" : "Public"}</strong>
						</div>
						<div>
							<p>Allowed to update Profile Picture</p>
							<strong>{view?.allowProfilePictureUpdate ? "Yes" : "No"}</strong>
						</div>
						<div>
							<p>Allowed to update Biography</p>
							<strong>{view?.allowBioUpdate ? "Yes" : "No"}</strong>
						</div>
						{view?.bio && (
							<div>
								<p>Biography</p>
								<strong>{view?.bio}</strong>
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button href={`/medibook/users?edit=${view?.id || ""}`} as={Link}>
							Edit
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		);
}
