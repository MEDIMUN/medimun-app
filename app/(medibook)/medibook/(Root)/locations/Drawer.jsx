"use client";
import { Input, Button, Textarea, Autocomplete, AutocompleteItem, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow, ButtonGroup } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addLocation } from "./add-location.server";
import { countries } from "@/data/countries";
import { flushSync } from "react-dom";
import Link from "next/link";

export default function Drawer({ locations }) {
	const { data: session, status } = useSession();
	const [isOpen, setIsOpen] = useState(false);

	const searchParams = useSearchParams();
	const edit = locations.find((location) => location.id == searchParams.get("edit"));
	const view = locations.find((location) => location.id == searchParams.get("view"));

	const [country, setCountry] = useState(edit?.country || "");
	const [isLoading, setIsLoading] = useState(false);
	const [phoneCode, setPhoneCode] = useState(edit?.phoneCode || "");
	const [slug, setSlug] = useState("");
	const router = useRouter();
	const { toast } = useToast();

	async function createLocationHandler(formData) {
		flushSync(() => {
			setIsLoading(true);
		});
		formData.append("editId", edit?.id || "");
		formData.append("phoneCode", phoneCode || edit?.phoneCode || "");
		formData.append("country", country || edit?.country || "");
		const res = await addLocation(formData);
		if (res) toast(res);
		if (res.ok) {
			setSlug("");
			setPhoneCode("");
			router.push(`/medibook/locations`);
			router.refresh();
		}
		setIsLoading(false);
	}

	useEffect(() => {
		setIsOpen((searchParams.get("add") == "" || searchParams.has("edit") || searchParams.has("view")) && status === "authenticated" && authorize(session, [s.management]));
	}, [searchParams, status, session]);

	if (searchParams.get("add") == "" || searchParams.has("edit")) {
		return (
			<Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={() => router.push(searchParams.get("return") || "/medibook/locations")}>
				<ModalContent className="overflow-y-auto" position="right" size="content">
					<ModalHeader className="flex flex-col gap-1">Add a Location</ModalHeader>
					<ModalBody>
						<form action={createLocationHandler} id="main" name="main" className="flex flex-col gap-4 py-4">
							<Input size="lg" defaultValue={edit?.name} label="Location Name" placeholder=" " isRequired labelPlacement="outside" type="text" minLength={2} maxLength={64} name="name" />
							<Input size="lg" defaultValue={edit?.slug} label="Link Slug" value={slug} onChange={(e) => setSlug(e.target.value.replace(" ", "-").replace(/[^a-z0-9-]/g, ""))} minLength={2} maxLength={32} name="slug" labelPlacement="outside" placeholder=" " />
							<Textarea size="lg" defaultValue={edit?.description} label="Description" minLength={10} maxLength={500} name="description" labelPlacement="outside" placeholder=" " />
							<Input size="lg" defaultValue={edit?.street} label="Street Address" type="text" minLength={5} maxLength={100} name="street" labelPlacement="outside" placeholder=" " />
							<Input size="lg" defaultValue={edit?.state} label="State / City" type="text" minLength={2} maxLength={50} name="state" labelPlacement="outside" placeholder=" " />
							<Input size="lg" defaultValue={edit?.zipCode} label="Zip Code" type="text" minLength={4} maxLength={10} name="zipCode" labelPlacement="outside" placeholder=" " />
							<Autocomplete size="lg" defaultSelectedKey={edit?.country || ""} onSelectionChange={setCountry} placeholder=" " labelPlacement="outside" defaultItems={countries} label="Country">
								{(country) => (
									<AutocompleteItem startContent={<Avatar alt="Flag" className="h-6 w-6" src={`https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`} />} key={country.countryCode}>
										{country.countryNameEn}
									</AutocompleteItem>
								)}
							</Autocomplete>
							<ButtonGroup className="gap-2">
								<Autocomplete size="lg" defaultSelectedKey={edit?.phoneCode} onSelectionChange={setPhoneCode} placeholder=" " labelPlacement="outside" defaultItems={countries} label="Code">
									{(country) => <AutocompleteItem key={country.countryCallingCode}>{"+" + country.countryCallingCode + " (" + country.countryNameEn + ")"}</AutocompleteItem>}
								</Autocomplete>
								<Input size="lg" defaultValue={edit?.phoneNumber} label="Number" labelPlacement="outside" placeholder=" " minLength={5} maxLength={100} name="phoneNumber" />
							</ButtonGroup>
							<Input size="lg" defaultValue={edit?.email} label="Location Email" type="email" minLength={5} maxLength={100} name="email" labelPlacement="outside" placeholder=" " />
							<Input size="lg" defaultValue={edit?.website} label="Location Website" type="url" minLength={5} maxLength={200} name="website" labelPlacement="outside" placeholder=" " />
							<Input size="lg" defaultValue={edit?.mapUrl} label="Google Maps URL" minLength={5} maxLength={200} name="mapUrl" labelPlacement="outside" placeholder=" " />
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
			<Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={() => router.push(searchParams.get("return") || "/medibook/locations")}>
				<ModalContent className="overflow-y-auto" position="right" size="content">
					<ModalHeader className="flex flex-col gap-1">Details of {view?.name}</ModalHeader>
					<ModalBody>
						<div>
							<p>Name</p>
							<strong>{view?.name}</strong>
						</div>
						{view?.slug && (
							<div>
								<p>Slug</p>
								<strong>{view?.slug}</strong>
							</div>
						)}
						{view?.description && (
							<div>
								<p>Description</p>
								<strong>{view?.description}</strong>
							</div>
						)}
						{view?.street && (
							<div>
								<p>Street Address</p>
								<strong>{view?.street}</strong>
							</div>
						)}
						{view?.state && (
							<div>
								<p>State / City</p>
								<strong>{view?.state}</strong>
							</div>
						)}
						{view?.zipCode && (
							<div>
								<p>Zip Code</p>
								<strong>{view?.zipCode}</strong>
							</div>
						)}
						{view?.country && (
							<div>
								<p>Country</p>
								<strong>{countries.find((country) => country.countryCode == view?.country)?.countryNameEn}</strong>
							</div>
						)}
						{view?.phoneCode && (
							<div>
								<p>Phone Number</p>
								<Link href={`tel:+${view?.phoneCode + view?.phoneNumber}`}>
									<strong className="text-blue-500">+{view?.phoneCode + " " + view?.phoneNumber}</strong>
								</Link>
							</div>
						)}
						{view?.email && (
							<div>
								<p>Email</p>
								<Link href={`mailto:${view?.email}`}>
									<strong>{view?.email}</strong>
								</Link>
							</div>
						)}
						{view?.website && (
							<div>
								<p>Website</p>
								<strong>{view?.website}</strong>
							</div>
						)}
						{view?.mapUrl && (
							<div>
								<p>Map URL</p>
								<strong>{view?.mapUrl}</strong>
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button href={`/medibook/locations?edit=${view.id}`} as={Link}>
							Edit
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		);
}
