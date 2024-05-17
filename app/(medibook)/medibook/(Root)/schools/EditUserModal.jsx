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
import { addSchool } from "./add-school.server";
import { countries } from "@/data/countries";
import { flushSync } from "react-dom";
import { SlugInput } from "@/components/slugInput";
import { useForm } from "react-hook-form";

export default function EditUserModal({ schools, locations }) {
	const { data: session, status } = useSession();
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();
	const { register, handleSubmit } = useForm();
	const registerWrapper = (name) => register(name, { size: "lg" });
	const searchParams = useSearchParams();
	const edit = schools.find((school) => school.id == searchParams.get("edit"));
	const view = schools.find((school) => school.id == searchParams.get("view"));

	const [isLoading, setIsLoading] = useState(false);
	const [location, setLocation] = useState(edit?.location || "");
	const [phoneCode, setPhoneCode] = useState(edit?.phoneCode || "");

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
			<Modal scrollBehavior="inside" placement="middle" isOpen={isOpen} onOpenChange={() => router.push(searchParams.get("return") || "/medibook/schools")}>
				<ModalContent>
					<ModalHeader>{searchParams.has("add") ? "Add a school" : "Edit School"}</ModalHeader>
					<ModalBody as="form" id="main" name="main" action={createSchoolHandler}>
						<Input size="lg" defaultValue={edit?.name} label="School Name" isRequired type="text" minLength={2} maxLength={64} name="name" />
						<SlugInput defaultValue={edit?.slug} label="Link Slug" name="slug" />
						<Input size="lg" defaultValue={edit?.joinYear} label="Year Joined" type="number" minLength={4} maxLength={4} name="joinYear" />
						<Textarea size="lg" defaultValue={edit?.description} label="Description" minLength={10} maxLength={500} name="description" />
						<Autocomplete size="lg" defaultSelectedKey={edit?.location?.id || ""} onSelectionChange={setLocation} defaultItems={locations} label="Location">
							{(location) => <AutocompleteItem key={location?.id}>{location.name}</AutocompleteItem>}
						</Autocomplete>
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
				<ModalContent>
					<ModalHeader>Details of {view?.name}</ModalHeader>
					<ModalBody>
						<Table removeWrapper hideHeader isStriped className="static z-0">
							<TableHeader>
								<TableColumn>KEY</TableColumn>
								<TableColumn>VALUE</TableColumn>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>NAME</TableCell>
									<TableCell>{view?.name}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>LOCATION</TableCell>
									<TableCell>{view?.location?.name}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>SLUG</TableCell>
									<TableCell>{view?.slug}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>DESCRIPTION</TableCell>
									<TableCell>{view?.description}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>YEAR JOINED</TableCell>
									<TableCell>{view?.joinYear}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>PHONE CODE</TableCell>
									<TableCell>{view?.phoneCode}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>PHONE NUMBER</TableCell>
									<TableCell>{view?.phoneNumber}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>EMAIL</TableCell>
									<TableCell>{view?.email}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>WEBSITE</TableCell>
									<TableCell>{view?.website}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>ZIP CODE</TableCell>
									<TableCell>{view?.location?.zipCode}</TableCell>
								</TableRow>
								//state
								<TableRow>
									<TableCell>STATE</TableCell>
									<TableCell>{view?.location?.state}</TableCell>
								</TableRow>
								//street
								<TableRow>
									<TableCell>STREET</TableCell>
									<TableCell>{view?.location?.street}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>MAP URL</TableCell>
									<TableCell>{view?.mapUrl}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
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
