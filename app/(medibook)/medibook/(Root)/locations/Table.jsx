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
import prisma from "@/prisma/client";
import * as SolarIconSet from "solar-icon-set";
import { deleteLocation } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Addresses({ locations }) {
	const { toast } = useToast();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function deleteLocationHandler(locationId) {
		setIsLoading(true);
		const res = await deleteLocation(locationId);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});

		if (res.ok) router.refresh();
		setIsLoading(false);
	}
	return (
		<>
			<Table removeWrapper isStriped isCompact className="static z-0">
				<TableHeader>
					<TableColumn>NAME</TableColumn>
					<TableColumn>ADDRESS</TableColumn>
					<TableColumn>LINKED SCHOOL</TableColumn>
					<TableColumn>ACTIONS</TableColumn>
				</TableHeader>
				<TableBody emptyContent={"No Locations Found"}>
					{locations.map((location, index) => {
						return (
							<TableRow key={location.id}>
								<TableCell>{location.name}</TableCell>
								<TableCell>{location.street + ", " + location.state + ", " + location.zipCode + ", " + location.country}</TableCell>
								<TableCell>
									{" "}
									{location.school[0] ? (
										<Link className="text-blue-500" href={`/medibook/schools?view=${location.school[0] ? location.school[0].id : ""}&return=/medibook/locations`}>
											{location.school[0].name} ↗
										</Link>
									) : (
										"No Linked School"
									)}
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button isDisabled={isLoading} isLoading={isLoading} type="submit" onPress={() => deleteLocationHandler(location.id)} color="danger" isIconOnly>
											<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" size={24} />
										</Button>
										<Button as={Link} href={`locations?edit=${location.id}`} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
											<SolarIconSet.PenNewSquare iconStyle="Outline" size={24} />
										</Button>
										<Button as={Link} href={`locations?view=${location.id}`} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
											<SolarIconSet.Eye iconStyle="Outline" size={24} />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</>
	);
}
