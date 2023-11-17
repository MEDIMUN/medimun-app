"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addLocation } from "./add-location.server";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { countries } from "@/data/countries";
import { cn } from "@/lib/utils";

export default function Drawer() {
	const { data: session, status } = useSession();
	const [isOpen, setIsOpen] = useState(false);
	const [countryOpen, setCountryOpen] = useState(false);
	const [phoneOpen, setPhoneOpen] = useState(false);
	const [phone, setPhone] = useState({ phoneCode: 357, phoneNumber: "" });
	const [country, setCountry] = useState("CY");
	const [slug, setSlug] = useState("");
	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function createLocationHandler(formData) {
		formData.append("country", country);
		formData.append("phoneCode", phone.phoneCode);
		const res = await addLocation(formData);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res.ok) {
			setCountry("CY");
			setSlug("");
			setPhone({ phoneCode: 357, phoneNumber: "" });
			redirect("/medibook/locations");
		}
	}

	useEffect(() => {
		setIsOpen(searchParams.get("add") == "" && status === "authenticated" && authorize(session, [s.management]));
	}, [searchParams, status, session]);

	const PhoneNumberInput = (props) => {
		return (
			<div className="flex">
				<Popover className="w-full " open={phoneOpen} onOpenChange={setPhoneOpen}>
					<PopoverTrigger asChild>
						<Button name="phoneCode" variant="outline" role="combobox" aria-expanded={open} className="justify-between rounded-r-none capitalize">
							{phone.phoneCode ? " +" + phone.phoneCode : "Country"}
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
											setPhone({ ...phone, phoneCode: country.countryCallingCode });
											setPhoneOpen(false);
										}}>
										<Check className={cn("mr-2 h-4 w-4", phone.phoneCode === country.countryCode ? "opacity-100" : "opacity-0")} />
										{"+" + country.countryCallingCode + " " + country.countryNameEn + ` ${country.countryNameEn == "Turkey" ? "(& Northern Cyprus)" : ""}`}
									</CommandItem>
								))}
							</CommandGroup>
						</Command>
					</PopoverContent>
				</Popover>
				<Input id="phoneNumber" name="phoneNumber" type="number" className="rounded-l-none border-l-0" />
			</div>
		);
	};

	const CountryInput = () => {
		return (
			<Popover className="w-full" open={countryOpen} onOpenChange={setCountryOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" role="combobox" aria-expanded={open} className="justify-between capitalize">
						{country ? countries.find((c) => c.countryCode == country)?.flag + " " + countries.find((c) => c.countryCode === country)?.countryNameEn : "Country"}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0">
					<Command>
						<CommandInput placeholder="Search country..." />
						<CommandEmpty>No country found.</CommandEmpty>
						<CommandGroup className="max-h-[300px] w-[330px] overflow-y-scroll">
							{countries.map((country) => (
								<CommandItem
									key={country}
									onSelect={(currentValue) => {
										setCountry(country.countryCode);
										setCountryOpen(false);
									}}>
									<Check className={cn("mr-2 h-4 w-4 opacity-0")} />
									{country.flag + " " + country.countryNameEn + `${country.countryCode == "CY" ? " (Both Sides)" : ""}`}
								</CommandItem>
							))}
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		);
	};

	return (
		<Sheet open={isOpen} onOpenChange={() => router.push("/medibook/locations")}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Add a Location</SheetTitle>
					<SheetDescription>This is the locations database. Other services requiring location data will pull the information from here.</SheetDescription>
				</SheetHeader>
				<form action={createLocationHandler} id="main" name="main" className="flex flex-col gap-4 py-4">
					<Label htmlFor="name">Name (Required)</Label>
					<Input type="text" required minLength={2} maxLength={64} id="name" name="name" className="col-span-3" />

					<Label htmlFor="slug">Slug (Optional)</Label>
					<Input type="text" value={slug} onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))} minLength={2} maxLength={50} id="slug" name="slug" className="col-span-3" placeholder="Enter slug (optional)" />

					<Label htmlFor="description">Description (Optional)</Label>
					<Textarea minLength={10} maxLength={500} id="description" name="description" className="col-span-3 max-h-[200px]" placeholder="Enter description (optional)" />

					<Label htmlFor="street">Street Address (Optional)</Label>
					<Input type="text" minLength={5} maxLength={100} id="street" name="street" className="col-span-3" placeholder="Enter street address (optional)" />

					<Label htmlFor="state">State (Optional)</Label>
					<Input type="text" minLength={2} maxLength={50} id="state" name="state" className="col-span-3" placeholder="Enter state (optional)" />

					<Label htmlFor="zipCode">Zip Code (Optional)</Label>
					<Input type="text" minLength={4} maxLength={10} id="zipCode" name="zipCode" className="col-span-3" placeholder="Enter zip code (optional)" />

					<Label htmlFor="country">Country (Optional)</Label>
					<CountryInput />

					<Label htmlFor="phone">Phone (Optional)</Label>
					<PhoneNumberInput />

					<Label htmlFor="email">Email (Optional)</Label>
					<Input type="email" minLength={5} maxLength={100} id="email" name="email" className="col-span-3" placeholder="Enter email (optional)" />

					<Label htmlFor="website">Website (Optional)</Label>
					<Input type="url" minLength={5} maxLength={200} id="website" name="website" className="col-span-3" placeholder="Enter website URL (optional)" />

					<Label htmlFor="mapUrl">Map URL (Optional)</Label>
					<Input type="url" minLength={5} maxLength={200} id="mapUrl" name="mapUrl" className="col-span-3" placeholder="Enter map URL (optional)" />
				</form>
				<SheetFooter>
					<Button form="main" className="mt-4 flex w-auto" type="submit">
						Save
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
{
	/* 	model Location {
		id            Int             @id @default(autoincrement())
		name          String
		slug          String?
		description   String?
		street        String?
		city          String?
		state         String?
		zipCode       String?
		country       String?
		phoneNumber         String?
		phoneCode String?
		email         String?
		website       String?
		mapUrl        String?
		school        School[]
		conferenceDay ConferenceDay[]
		workshopDay   WorkshopDay[]
	 }
} */
}
