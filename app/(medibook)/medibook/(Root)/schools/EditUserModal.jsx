"use client";
import { Input, Button, Textarea, Autocomplete, AutocompleteItem, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow, ButtonGroup } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addSchool } from "./add-school.server";
import { countries } from "@/data/countries";
import { flushSync } from "react-dom";
import Link from "next/link";

export default function EditUserModal({ schools, locations }) {
	const { data: session, status } = useSession();
	const [isOpen, setIsOpen] = useState(false);

	const searchParams = useSearchParams();
	const edit = schools.find((school) => school.id == searchParams.get("edit"));
	const view = schools.find((school) => school.id == searchParams.get("view"));

	const [isLoading, setIsLoading] = useState(false);
	const [location, setLocation] = useState(edit?.location || "");
	const [phoneCode, setPhoneCode] = useState(edit?.phoneCode || "");
	const [slug, setSlug] = useState("");
	const router = useRouter();
	const { toast } = useToast();

	async function createSchoolHandler(formData) {
		flushSync(() => {
			setIsLoading(true);
		});
		formData.append("editId", edit?.id || "");
		formData.append("phoneCode", phoneCode || edit?.phoneCode || "");
		formData.append("locationId", location || edit?.location?.id || "");
		const res = await addSchool(formData);
		if (res) toast(res);
		if (res.ok) {
			setSlug("");
			setPhoneCode("");
			router.push(`/medibook/schools`);
			router.refresh();
		}
		setIsLoading(false);
	}

	useEffect(() => {
		setIsOpen((searchParams.get("add") == "" || searchParams.has("edit") || searchParams.has("view")) && status === "authenticated" && authorize(session, [s.management]));
	}, [searchParams, status, session]);

	if (searchParams.get("add") == "" || searchParams.has("edit")) {
		return (
			<Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={() => router.push(searchParams.get("return") || "/medibook/schools")}>
				<ModalContent className="overflow-y-auto" position="right" size="content">
					<ModalHeader className="flex flex-col gap-1">Add a School</ModalHeader>
					<ModalBody>
						<form action={createSchoolHandler} id="main" name="main" className="flex flex-col gap-4 py-4">
							<Input size="lg" defaultValue={edit?.name} label="School Name" placeholder=" " isRequired labelPlacement="outside" type="text" minLength={2} maxLength={64} name="name" />
							<Input
								size="lg"
								defaultValue={edit?.slug}
								label="Link Slug"
								value={slug}
								onChange={(e) =>
									setSlug(
										e.target.value
											.replace(" ", "-")
											.replace(/[^a-zA-Z0-9-]/g, "")
											.toLowerCase()
									)
								}
								minLength={2}
								maxLength={32}
								name="slug"
								labelPlacement="outside"
								placeholder=" "
							/>
							<Input size="lg" defaultValue={edit?.joinYear} label="Year Joined" placeholder=" " labelPlacement="outside" type="number" minLength={4} maxLength={4} name="joinYear" />
							<Textarea size="lg" defaultValue={edit?.description} label="Description" minLength={10} maxLength={500} name="description" labelPlacement="outside" placeholder=" " />
							<Autocomplete size="lg" defaultSelectedKey={edit?.location?.id || ""} onSelectionChange={setLocation} placeholder=" " labelPlacement="outside" defaultItems={locations} label="Location">
								{(location) => <AutocompleteItem key={location?.id}>{location.name}</AutocompleteItem>}
							</Autocomplete>
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
			<Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={() => router.push(searchParams.get("return") || "/medibook/schools")}>
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
								<strong>{view?.location.description}</strong>
							</div>
						)}
						{view?.location?.street && (
							<div>
								<p>Street Address</p>
								<strong>{view?.location?.street}</strong>
							</div>
						)}
						{view?.location?.state && (
							<div>
								<p>State / City</p>
								<strong>{view?.location?.state}</strong>
							</div>
						)}
						{view?.location?.zipCode && (
							<div>
								<p>Zip Code</p>
								<strong>{view?.location?.zipCode}</strong>
							</div>
						)}
						{view?.location?.country && (
							<div>
								<p>Country</p>
								<strong>{countries.find((country) => country.countryCode == view?.location.country)?.countryNameEn}</strong>
							</div>
						)}
						{view?.location?.phoneCode && (
							<div>
								<p>Phone Number</p>
								<Link href={`tel:+${view?.location.phoneCode + view?.location.phoneNumber}`}>
									<strong className="text-blue-500">+{view?.location.phoneCode + " " + view?.location.phoneNumber}</strong>
								</Link>
							</div>
						)}
						{view?.location?.email && (
							<div>
								<p>Email</p>
								<Link href={`mailto:${view?.location.email}`}>
									<strong>{view?.location.email}</strong>
								</Link>
							</div>
						)}
						{view?.location?.website && (
							<div>
								<p>Website</p>
								<strong>{view?.location.website}</strong>
							</div>
						)}
						{view?.location?.mapUrl && (
							<div>
								<p>Map URL</p>
								<strong>{view?.location.mapUrl}</strong>
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button href={`/medibook/schools?edit=${view.id}`} as={Link}>
							Edit
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		);
}

/* model School {
	id          String           @id @default(uuid())
	name        String           @unique
	description String?
	slug        String           @unique
	joinYear    Int?
	location    Location?        @relation(fields: [locationId], references: [id])
	locationId  String?
	director    SchoolDirector[]
	student     Student[]
 } */
