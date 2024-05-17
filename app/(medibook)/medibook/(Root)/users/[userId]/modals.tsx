"use client";

import { Input, Button, Textarea, Autocomplete, AutocompleteItem, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow, ButtonGroup, Select, SelectSection, SelectItem, DatePicker } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { editUser } from "./actions";
import { countries } from "@/data/countries";
import { flushSync } from "react-dom";
import { removeSearchParams } from "@/lib/searchParams";
import { drawerProps } from "@/constants";
import { CalendarDate, parseDate } from "@internationalized/date";
import { toast } from "sonner";
import { SlugInput } from "@/components/slugInput";
import ProfileUploader from "./ProfilePictureFrame";

export function EditUserModal({ user, schools }) {
	const { data: session, status } = useSession();

	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const edit = user;

	const [schoolId, setSchoolId] = useState("");
	const [nationality, setNationality] = useState("");
	const [phoneCode, setPhoneCode] = useState("");

	const router = useRouter();

	async function createUserHandler(formData) {
		flushSync(() => {
			setIsLoading(true);
		});
		formData.append("nationality", nationality);
		formData.append("phoneCode", phoneCode);
		formData.append("schoolId", schoolId);
		formData.append("id", edit?.id);
		const res = await editUser(formData);
		if (res) toast(res?.message);
		if (res?.ok) {
			setPhoneCode("");
			setSchoolId("");
			removeSearchParams({ edit: "", view: "", add: "" }, router);
			router.refresh();
		}
		setIsLoading(false);
	}

	useEffect(() => {
		setSchoolId(edit?.schoolId || "");
		setNationality(edit?.nationality || "");
		setPhoneCode(edit?.phoneCode || "");
	}, [searchParams, status, session]);

	return (
		<Modal
			{...drawerProps}
			isOpen={searchParams.get("edit") && status === "authenticated" && authorize(session, [s.management])}
			onOpenChange={() => {
				removeSearchParams({ edit: "", view: "", add: "" }, router);
			}}>
			<ModalContent className="overflow-y-auto" position="right" size="content">
				<ModalHeader className="flex flex-col gap-1">Edit User</ModalHeader>
				<ModalBody as="form" id="main" action={createUserHandler}>
					<ProfileUploader user={edit} />
					<Input size="lg" maxLength={50} isRequired type="email" name="email" label="Email" defaultValue={edit?.email} />
					<Input size="lg" maxLength={50} isRequired type="text" name="officialName" label="Official Name" defaultValue={edit?.officialName} />
					<Input size="lg" maxLength={50} isRequired type="text" name="officialSurname" label="Official Surname" defaultValue={edit?.officialSurname} />
					<Input size="lg" maxLength={50} type="text" name="displayName" label="Display Name" defaultValue={edit?.displayName} />
					<DatePicker size="lg" isRequired defaultValue={edit?.dateOfBirth && parseDate(edit?.dateOfBirth?.toISOString().substring(0, 10))} name="dateOfBirth" label="Date of Birth" />
					<Autocomplete size="lg" selectedKey={schoolId} onSelectionChange={setSchoolId} defaultItems={schools} label="School">
						{(school) => <AutocompleteItem key={school.id}>{school.name}</AutocompleteItem>}
					</Autocomplete>
					<SlugInput separator="_" startContent="@" size="lg" label="Username" defaultValue={edit?.username} name="username" />
					<div className="flex">
						<Select popoverProps={{ className: "w-[400px]" }} classNames={{ trigger: "rounded-r-none" }} className="max-w-[100px]" renderValue={(item) => "+" + item[0]?.data?.countryCallingCode} size="lg" selectedKeys={[phoneCode]} onChange={(e) => setPhoneCode(e.target.value)} items={countries} label="Code">
							{(country) => (
								<SelectItem key={country.countryCode} startContent={<Avatar alt="Flag" className="h-6 w-6" src={`https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`} />}>
									{`+${country.countryCallingCode} (${country.countryNameEn})`}
								</SelectItem>
							)}
						</Select>
						<Input classNames={{ inputWrapper: "rounded-l-none" }} size="lg" defaultValue={edit?.phoneNumber} label="Number" maxLength={100} name="phoneNumber" />
					</div>
					<Select size="lg" defaultSelectedKeys={[edit?.nationality || null]} onChange={(e) => setNationality(e.target.value)} items={countries} label="Nationality">
						{(country) => (
							<SelectItem startContent={<Avatar className="h-6 w-6" src={`https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`} />} key={country.countryCode}>
								{country.countryNameEn}
							</SelectItem>
						)}
					</Select>
					<Select defaultSelectedKeys={[edit?.isProfilePrivate ? "true" : "false"]} size="lg" name="isProfilePrivate" label="Profile Visibility">
						<SelectItem key="false">Public</SelectItem>
						<SelectItem key="true">Private</SelectItem>
					</Select>
					<Select size="lg" defaultSelectedKeys={[edit?.gender || null]} name="gender" label="Gender">
						<SelectItem key="FEMALE">Female</SelectItem>
						<SelectItem key="MALE">Male</SelectItem>
						<SelectItem key="NONBINARY">Non-Binary</SelectItem>
						<SelectItem key="OTHER">Other</SelectItem>
						<SelectItem key="PREFERNOTTOANSWER">Prefer not to Answer</SelectItem>
					</Select>
					<Input size="lg" defaultValue={edit?.pronouns} label="Pronouns" placeholder="Separate with commas" type="text" name="pronouns" maxLength={50} />
					<Textarea size="lg" defaultValue={edit?.bio} label="Biography" maxLength={500} name="bio" />
				</ModalBody>
				<ModalFooter>
					<Button isLoading={isLoading} form="main" type="submit">
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
