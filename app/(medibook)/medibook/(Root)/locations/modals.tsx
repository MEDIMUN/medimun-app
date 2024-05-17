"use client";
import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Autocomplete, AutocompleteSection, AutocompleteItem } from "@nextui-org/autocomplete";
import { Badge } from "@nextui-org/badge";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";
import { Chip } from "@nextui-org/chip";
import { CircularProgress } from "@nextui-org/progress";
import { Code } from "@nextui-org/code";
import { Divider } from "@nextui-org/divider";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from "@nextui-org/dropdown";
import { Input } from "@nextui-org/input";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Listbox, ListboxSection, ListboxItem } from "@nextui-org/listbox";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@nextui-org/navbar";
import { Pagination, PaginationItem, PaginationCursor } from "@nextui-org/pagination";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Progress } from "@nextui-org/progress";
import { RadioGroup, Radio } from "@nextui-org/radio";
import { Select, SelectSection, SelectItem } from "@nextui-org/select";
import { Skeleton } from "@nextui-org/skeleton";
import { Snippet } from "@nextui-org/snippet";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Spacer } from "@nextui-org/spacer";
import { Spinner } from "@nextui-org/spinner";
import { Switch } from "@nextui-org/switch";
import { Slider } from "@nextui-org/slider";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Textarea } from "@nextui-org/input";
import { Tooltip } from "@nextui-org/tooltip";
import { User } from "@nextui-org/user";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addLocation } from "./actions";
import { countries } from "@/data/countries";
import { flushSync } from "react-dom";
import { drawerProps } from "@/constants";
import { SlugInput } from "@/components/slugInput";

export function AddLocationModal({ locations }) {
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
			<Modal {...drawerProps} isOpen={isOpen} onOpenChange={() => router.push(searchParams.get("return") || "/medibook/locations")}>
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">Add a Location</ModalHeader>
					<ModalBody as="form" id="main" action={createLocationHandler}>
						<Input size="lg" defaultValue={edit?.name} label="Location Name" isRequired type="text" minLength={2} maxLength={64} name="name" />
						<SlugInput defaultValue={edit?.slug} label="Link Slug" name="slug" />
						<Textarea size="lg" defaultValue={edit?.description} label="Description" minLength={10} maxLength={500} name="description" />
						<div>
							<Input classNames={{ inputWrapper: "rounded-b-none" }} size="lg" defaultValue={edit?.street} label="Street Address" type="text" minLength={5} maxLength={100} name="street" />
							<Input classNames={{ inputWrapper: "rounded-t-none rounded-b-none" }} size="lg" defaultValue={edit?.state} label="Town / City" type="text" minLength={2} maxLength={50} name="state" />
							<div className="flex">
								<Input classNames={{ inputWrapper: "rounded-t-none rounded-r-none" }} size="lg" defaultValue={edit?.zipCode} label="Zip Code" type="text" minLength={4} maxLength={10} name="zipCode" />
								<Autocomplete classNames={{ listboxWrapper: "w-[400px]", listbox: "w-[400px]", popoverContent: "w-[400px] -translate-x-[200px]" }} inputProps={{ classNames: { inputWrapper: "rounded-t-none rounded-l-none" } }} size="lg" defaultSelectedKey={edit?.country || ""} onSelectionChange={setCountry} defaultItems={countries} label="Country">
									{(country) => (
										<AutocompleteItem startContent={<Avatar alt="Flag" className="h-6 w-6" src={`https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`} />} key={country.countryCode}>
											{country.countryNameEn}
										</AutocompleteItem>
									)}
								</Autocomplete>
							</div>
						</div>
						<ButtonGroup className="gap-2">
							<Autocomplete size="lg" defaultSelectedKey={edit?.phoneCode} onSelectionChange={setPhoneCode} defaultItems={countries} label="Code">
								{(country) => <AutocompleteItem key={country.countryCallingCode}>{"+" + country.countryCallingCode + " (" + country.countryNameEn + ")"}</AutocompleteItem>}
							</Autocomplete>
							<Input size="lg" defaultValue={edit?.phoneNumber} label="Number" minLength={5} maxLength={100} name="phoneNumber" />
						</ButtonGroup>
						<Input size="lg" defaultValue={edit?.email} label="Location Email" type="email" minLength={5} maxLength={100} name="email" />
						<Input size="lg" defaultValue={edit?.website} label="Location Website" type="url" minLength={5} maxLength={200} name="website" />
						<Input size="lg" defaultValue={edit?.mapUrl} label="Google Maps URL" minLength={5} maxLength={200} name="mapUrl" />
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
