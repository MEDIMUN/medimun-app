"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label as Lbl } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { countries } from "@/data/countries.js";
import { titleCase } from "@/lib/title-case";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "./get-user";
import { updateUser } from "./update-user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfileUploader from "./ProfilePictureFrame";
import { Outer } from "./ProfilePictureFrame";
import { Badge } from "@/components/ui/badge";

export default function Page() {
	const { data: session, status, update } = useSession();
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [phoneOpen, setPhoneOpen] = useState(false);

	const { toast } = useToast();

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

	function handleOnChange(e) {
		if (e.target.name == "dateOfBirth") return setPerson({ ...person, dateOfBirth: moment(new Date(date.target.value)).format("YYYY-MM-DD") });
		setPerson({
			...person,
			[e.target.name]: e.target.value,
		});
	}

	const formatName = (name) => {
		return titleCase(titleCase(titleCase(name?.replace("  ", "").toLowerCase(), " "), "-"), "'");
	};

	async function updateUserHandler() {
		const newPerson = {
			...person,
			officialName: formatName(person.officialName),
			officialSurname: formatName(person.officialSurname),
			displayName: formatName(person.displayName),
			pronoun1: formatName(person.pronoun1),
			pronoun2: formatName(person.pronoun2),
			phoneNumber: person.phoneNumber,
			phoneCode: person.phoneCode,
			dateOfBirth: new Date(person.dateOfBirth),
		};
		const res = await updateUser(newPerson);
		if (res) toast({ title: res?.title, description: res?.description, variant: res?.variant || "default" });
		if (res.ok) update();
		router.replace("/medibook/account");
	}

	async function fetchUserData() {
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
	}

	useEffect(() => {
		fetchUserData();
	}, []);

	const Inp = (props) => {
		return (
			<Outer>
				<Label className="my-auto ml-2 min-w-max" htmlFor={props.id}>
					{props.name}
					{!props.hideBadge && <Badge className="ml-2">{props.required ? "Required" : "Optional"}</Badge>}
				</Label>
				<Input className="text-md md:text-sm" value={props.value} onChange={props.onChange} required={props.required} id={props.id} label={props.id} name={props.id} type={props.type} disabled={props.disabled} />
			</Outer>
		);
	};

	const Label = (props) => {
		return (
			<Lbl className="my-auto ml-2 min-w-max" htmlFor={props.id}>
				{props.children}
			</Lbl>
		);
	};

	const PhoneNumberInput = (props) => {
		return (
			<Outer>
				<Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
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
					<Input onChange={handleOnChange} value={person.phoneNumber} id="phoneNumber" name="phoneNumber" label="phoneNumber" type="number" className="rounded-l-none border-l-0" />
				</div>
			</Outer>
		);
	};

	const NationalityInput = () => {
		return (
			<Outer>
				<Label htmlFor="officialName">Nationality (Required)</Label>
				<Popover className="w-full" open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline" role="combobox" aria-expanded={open} className="justify-between capitalize">
							{person.nationality ? countries.find((country) => country.countryCode === person.nationality)?.flag + " " + countries.find((country) => country.countryCode === person.nationality)?.countryNameEn : "Country"}
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
			</Outer>
		);
	};

	if (!(status === "authenticated" && session.user)) return <p>Loading</p>;

	return (
		<div className="flex flex-col gap-2 font-[montserrat]">
			<Outer>
				<ProfileUploader />
			</Outer>
			<form action={updateUserHandler} className="flex flex-col gap-2">
				<Inp name="User ID" value={person.id} hideBadge disabled onChange={handleOnChange} id="userId" type="text" />
				<Inp name="Official Name" value={formatName(person.officialName)} required onChange={handleOnChange} id="officialName" type="text" />
				<Inp name="Official Surname" value={formatName(person.officialSurname)} required onChange={handleOnChange} id="officialSurname" type="text" />
				<Inp name="Display Name" value={formatName(person.displayName)} onChange={handleOnChange} id="displayName" type="text" />
				<Inp name="Date of Birth" value={person.dateOfBirth} required onChange={handleOnChange} id="dateOfBirth" type="date" />
				<NationalityInput />
				<PhoneNumberInput />
				<Inp name="Gender" value={person.gender} onChange={handleOnChange} id="gender" type="text" />
				<div className="flex w-full flex-row">
					<Inp name="Pronoun #1" value={formatName(person.pronoun1)} onChange={handleOnChange} id="pronoun1" type="text" />
					<Inp name="Pronoun #2" value={formatName(person.pronoun2)} onChange={handleOnChange} id="pronoun2" type="text" />
				</div>
				<Outer>
					<Button type="submit">Save</Button>
				</Outer>
			</form>
		</div>
	);
}
