"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { countries } from "@/data/countries.js";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { titleCase } from "@/lib/title-case";
import { updateUser } from "./update-user";
import { getUser } from "./get-user";
import moment from "moment";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Page() {
	const [open, setOpen] = useState(false);
	const [phoneOpen, setPhoneOpen] = useState(false);
	const { toast } = useToast();
	const router = useRouter();
	const { update } = useSession();

	const [person, setPerson] = useState({
		officialName: "",
		officialSurname: "",
		displayName: "",
		pronoun1: "",
		pronoun2: "",
		phoneCode: "",
		nationality: "",
		phoneNumber: "",
		phoneCode: "",
		gender: "",
		dateOfBirth: moment().format("YYYY-MM-DD"),
		id: "",
	});

	const onChangeDate = (date) => {
		const newDate = moment(new Date(date.target.value)).format("YYYY-MM-DD");
		setPerson({ ...person, dateOfBirth: newDate });
		console.log(newDate); //always log "1970-01-01"
	};

	function handleOnChange(e) {
		setPerson(
			(prev) =>
				(prev = {
					...person,
					[e.target.name]: e.target.value,
				})
		);
	}

	async function updateUserHandler() {
		const newPerson = {
			...person,
			officialName: titleCase(titleCase(titleCase(person.officialName?.replace("  ", "").toLowerCase(), " "), "-"), "'"),
			officialSurname: titleCase(titleCase(titleCase(person.officialSurname?.replace("  ", "").toLowerCase(), " "), "-"), "'"),
			displayName: titleCase(titleCase(titleCase(person.displayName?.replace("  ", "").toLowerCase(), " "), "-"), "'"),
			pronoun1: titleCase(titleCase(titleCase(person.pronoun1?.replace("  ", "").toLowerCase(), " "), "-"), "'"),
			pronoun2: titleCase(titleCase(titleCase(person.pronoun2?.replace("  ", "").toLowerCase(), " "), "-"), "'"),
			phoneNumber: person.phoneNumber,
			phoneCode: person.phoneCode,
			dateOfBirth: new Date(person.dateOfBirth),
		};
		const res = await updateUser(newPerson);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant || "default",
			});
		if (res.ok) {
			update();
		}
		router.replace("/medibook/account");
	}

	async function updateUserData() {
		const fetch = await getUser();
		let user = {
			...person,
			officialName: fetch?.officialName || "",
			officialSurname: fetch?.officialSurname || "",
			displayName: fetch?.displayName || "",
			pronoun1: fetch?.pronoun1 || "",
			pronoun2: fetch?.pronoun2 || "",
			nationality: fetch?.nationality || "",
			phoneNumber: fetch?.phoneNumber || "",
			phoneCode: fetch?.phoneCode || "",
			gender: fetch?.gender || "",
			id: fetch?.id || "",
			dateOfBirth: moment(new Date(fetch?.dateOfBirth)).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD"),
		};
		setPerson(user);
		console.log(user);
	}

	useEffect(() => {
		updateUserData();
	}, []);

	return (
		<div>
			<form action={updateUserHandler} className="mb-[400px] grid max-h-full gap-10 p-1 pt-0">
				<div className="flex flex-col gap-2">
					<Label htmlFor="userId">User ID</Label>
					<p className="text-sm">Your unique identifier</p>
					<Input value={person.id} disabled className="bg-black text-white disabled:text-white disabled:opacity-100" id="userId" />
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="officialName">Official Name (Required)</Label>
					<p className="text-sm">Must match the name on your passport and be written only using the latin alphabet.</p>
					<Input
						value={titleCase(titleCase(titleCase(person.officialName?.replace("  ", "").toLowerCase(), " "), "-"), "'")}
						onChange={handleOnChange}
						required
						id="officialName"
						name="officialName"
						label="officialName"
						type="text"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="officialSurname">Official Surname (Required)</Label>
					<p className="text-sm"> Must match the surname on your passport and be written only using the latin alphabet.</p>
					<Input
						value={titleCase(titleCase(titleCase(person.officialSurname?.replace("  ", "").toLowerCase(), " "), "-"), "'")}
						onChange={handleOnChange}
						required
						id="officialSurname"
						name="officialSurname"
						label="officialSurname"
						type="text"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="displayName">Display Name (Optional)</Label>
					<p className="text-sm">
						Your display name will be visible to other users and will be placed on your name tag meanwhile it will not be used on your certificate. It can be your real name or a
						nickname. You can change it or remove it at any time.
					</p>
					<Input
						value={titleCase(titleCase(titleCase(person.displayName?.replace("  ", "").toLowerCase(), " "), "-"), "'")}
						onChange={handleOnChange}
						id="displayName"
						name="displayName"
						label="displayName"
						type="text"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="dateOfBirth">Date Of Birth (Required)</Label>
					<p className="text-sm">
						Your display name will be visible to other users and will be placed on your name tag meanwhile it will not be used on your certificate. It can be your real name or a
						nickname. You can change it or remove it at any time.
					</p>
					<Input value={person.dateOfBirth} onChange={(e) => onChangeDate(e)} id="dateOfBirth" name="dateOfBirth" label="dateOfBirth" type="date" />
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="officialName">Nationality (Required)</Label>
					<p className="text-sm">This should reflect where you were born or the language you speak</p>
					<Popover className="w-full" open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button variant="outline" role="combobox" aria-expanded={open} className="justify-between capitalize">
								{person.nationality
									? countries.find((country) => country.countryCode === person.nationality)?.flag +
									  " " +
									  countries.find((country) => country.countryCode === person.nationality)?.countryNameEn
									: "Country"}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-full p-0">
							<Command>
								<CommandInput placeholder="Search country..." />
								<CommandEmpty>No country found.</CommandEmpty>
								<CommandGroup className="max-h-[300px] w-[330px] overflow-auto">
									{countries.map((country) => (
										<CommandItem
											key={country.countryCode}
											onSelect={(currentValue) => {
												setPerson({ ...person, nationality: country.countryCode });
												setOpen(false);
											}}>
											<Check className={cn("mr-2 h-4 w-4", person.nationality === country.countryCode ? "opacity-100" : "opacity-0")} />
											{country.flag + " " + country.countryNameEn + `${country.countryCode == "CY" ? " (Both Sides)" : ""}`}
										</CommandItem>
									))}
								</CommandGroup>
							</Command>
						</PopoverContent>
					</Popover>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
					<p className="text-sm">
						Your display name will be visible to other users and will be placed on your name tag meanwhile it will not be used on your certificate. It can be your real name or a
						nickname. You can change it or remove it at any time.
					</p>
					<div className="flex">
						<Popover className="w-full " open={phoneOpen} onOpenChange={setPhoneOpen}>
							<PopoverTrigger asChild>
								<Button name="phoneCode" variant="outline" role="combobox" aria-expanded={open} className="justify-between rounded-r-none capitalize">
									{person.phoneCode ? " +" + person.phoneCode : "Country"}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 rounded-r-none opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0">
								<Command>
									<CommandInput placeholder="Search country or code..." />
									<CommandEmpty>No country found.</CommandEmpty>
									<CommandGroup className="max-h-[300px] w-[330px] overflow-auto">
										{countries.map((country) => (
											<CommandItem
												key={country.countryCode}
												onSelect={(currentValue) => {
													setPerson({ ...person, phoneCode: country.countryCallingCode });
													setPhoneOpen(false);
												}}>
												<Check className={cn("mr-2 h-4 w-4", person.phoneCode === country.countryCode ? "opacity-100" : "opacity-0")} />
												{"+" + country.countryCallingCode + " " + country.countryNameEn + ` ${country.countryNameEn == "Turkey" ? "(& Northern Cyprus)" : ""}`}
											</CommandItem>
										))}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>
						<Input
							onChange={handleOnChange}
							value={person.phoneNumber}
							id="phoneNumber"
							name="phoneNumber"
							label="phoneNumber"
							type="number"
							className="rounded-l-none border-l-0"
						/>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="gender">Gender (Optional)</Label>
					<p className="text-sm">Will only be visible to organisers</p>
					<Input value={person.gender} onChange={handleOnChange} id="gender" name="gender" label="gender" type="text" />
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="officialSurname">Pronouns (Optional)</Label>
					<p className="text-sm">Will be visible on your profile and will be printed on your name tag.</p>
					<div className="flex flex-row">
						<Input
							maxLength={5}
							minLength={2}
							value={titleCase(titleCase(titleCase(person.pronoun1?.replace(" ", "").toLowerCase(), " "), "-"), "'")}
							onChange={handleOnChange}
							className="rounded-r-none"
							id="pronoun1"
							name="pronoun1"
							label="pronoun1"
							type="text"
						/>
						<Input
							maxLength={5}
							minLength={2}
							value={titleCase(titleCase(titleCase(person.pronoun2?.replace(" ", "").toLowerCase(), " "), "-"), "'")}
							onChange={handleOnChange}
							className="rounded-l-none border-l-0"
							id="pronoun2"
							name="pronoun2"
							label="pronoun2"
							type="text"
						/>
					</div>
				</div>
				<Button type="submit" className="justify-center">
					Save
				</Button>
			</form>
		</div>
	);
}
