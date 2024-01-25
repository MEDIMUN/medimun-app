"use client";
import { Input, Button, Textarea, Spacer, Autocomplete, AutocompleteItem, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow, ButtonGroup, Select, SelectSection, SelectItem } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { countries } from "@/data/countries";
import Link from "next/link";
import * as SolarIconSet from "solar-icon-set";
import { editUser } from "./edit-user.server";
import { flushSync } from "react-dom";
import ProfileUploader from "./ProfilePictureFrame";
import TopBar from "@/components/medibook/TopBar";

export default function AccountForm({ session, user, schools }) {
	const [schoolId, setSchoolId] = useState(user.student[0]?.school.id);
	const [nationality, setNationality] = useState(user.nationality);
	const [phoneCode, setPhoneCode] = useState(user.phoneCode);
	const [username, setUsername] = useState(user.username);
	const [officialName, setOfficialName] = useState(user.officialName);
	const [officialSurname, setOfficialSurname] = useState(user.officialSurname);
	const [displayName, setDisplayName] = useState(user.displayName);
	const [email, setEmail] = useState(user.email);
	const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
	const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth?.toISOString().substring(0, 10));
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { toast } = useToast();
	async function updateUserHandler(formData) {
		flushSync(() => {
			setIsLoading(true);
		});
		formData.append("nationality", nationality);
		formData.append("phoneCode", phoneCode);
		formData.append("username", username);
		formData.append("email", email);
		formData.append("schoolId", schoolId);
		const res = await editUser(formData);
		if (res) toast(res);
		if (res?.ok) {
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

	return (
		<>
			<TopBar title="Account Settings">
				<Button as={Link} href={`/medibook/users/${user?.username ? `@${user.username}` : user?.id}`} className="my-auto ml-auto">
					View Profile
				</Button>
			</TopBar>
			<div className="flex h-[calc(100%-101px)] flex-col gap-4 overflow-y-auto rounded-2xl border-1 border-gray-200 p-4">
				<ScrollShadow>
					<ProfileUploader user={user} />
					<form action={updateUserHandler} id="main" className="flex w-full flex-col gap-4 align-middle shadow-sm">
						<Input size="lg" color="danger" isReadOnly startContent="#" defaultValue={user.id} label="User ID (Can't be modified)" name="id" />
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
							value={displayName || ""}
							label="Preferred Name"
							type="text"
							minLength={2}
							maxLength={64}
							name="displayName"
						/>
						<Autocomplete size="lg" defaultSelectedKey={schoolId || null} onSelectionChange={setSchoolId} defaultItems={schools} label="School">
							{(school) => (
								<AutocompleteItem value={school.id} key={school.id}>
									{school.name}
								</AutocompleteItem>
							)}
						</Autocomplete>
						<ButtonGroup className="gap-2">
							<Autocomplete size="lg" defaultSelectedKey={phoneCode || null} onSelectionChange={setPhoneCode} defaultItems={countries} label="Code">
								{(country) => (
									<AutocompleteItem startContent={<Avatar alt="Flag" className="h-6 w-6" src={`https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`} />} key={country.countryCode}>
										{"+" + country.countryCallingCode + " (" + country.countryNameEn + ")"}
									</AutocompleteItem>
								)}
							</Autocomplete>
							<Input size="lg" onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} value={phoneNumber} label="Number" minLength={5} maxLength={100} name="phoneNumber" />
						</ButtonGroup>
						<Input size="lg" defaultValue={dateOfBirth} label="Date of Birth" type="date" minLength={2} maxLength={64} name="dateOfBirth" />
						<Autocomplete size="lg" defaultSelectedKey={nationality || null} onSelectionChange={setNationality} defaultItems={countries} label="Nationality">
							{(country) => (
								<AutocompleteItem startContent={<Avatar alt="Flag" className="h-6 w-6" src={`https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`} />} key={country.countryCode}>
									{country.countryNameEn}
								</AutocompleteItem>
							)}
						</Autocomplete>
						<Input
							startContent="@"
							size="lg"
							label="Username"
							value={username || ""}
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
						<Select size="lg" defaultSelectedKeys={[user.gender || null]} name="gender" label="Gender">
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
							<Input size="lg" defaultValue={user.pronoun1} label="Pronoun 1" type="text" minLength={2} maxLength={4} name="pronoun1" />
							<Input size="lg" defaultValue={user.pronoun2} label="Pronoun 2" type="text" minLength={2} maxLength={4} name="pronoun2" />
						</ButtonGroup>

						<Textarea isDisabled={!authorize(session, [s.management, s.manager, s.member, s.schooldirector, s.chair, s.manager])} size="lg" defaultValue={user.bio} label="Biography" maxLength={512} name="bio" />
						<Button type="submit" size="lg" color="primary">
							Update
						</Button>
					</form>
				</ScrollShadow>
			</div>
		</>
	);
}
