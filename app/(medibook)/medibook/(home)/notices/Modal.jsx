"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
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
import { removeSearchParams } from "@/lib/searchParams";
import { useState } from "react";
import { createGlobalAnnouncement, deleteGlobalAnnouncement } from "./create-announcement.server";

export default function Drawer({ edit, selectedSession }) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [privacy, setPrivacy] = useState(edit?.privacy || "NORMAL");
	const searchParams = useSearchParams();
	const { toast } = useToast();

	async function createAnnouncementHandler(formData) {
		formData.append("editId", edit?.id);
		formData.append("privacy", privacy);
		const res = await createGlobalAnnouncement(formData);
		if (res) toast(res);
		if (res?.ok) {
			removeSearchParams({ add: "", edit: "", delete: "" }, router);
			router.refresh();
		}
	}

	return (
		<Modal
			size="full"
			onOpenChange={() => {
				removeSearchParams({ add: "", edit: "", delete: "", view: "" }, router);
				router.refresh();
			}}
			isOpen={(searchParams.has("add") || searchParams.has("edit")) && status === "authenticated" && authorize(session, [s.management])}>
			<ModalContent>
				<ModalHeader>Create/Edit Notice</ModalHeader>
				<ModalBody as="form" action={createAnnouncementHandler} id="main" name="main">
					<Input defaultValue={edit?.title} isRequired label="Title" size="lg" name="title" />
					<Input defaultValue={edit?.description} label="Description" size="lg" name="description" />
					<Select defaultSelectedKeys={[edit?.privacy || "NORMAL"]} onChange={(e) => setPrivacy(e.target.value)} isRequired size="lg" label="Privacy">
						<SelectItem key="ANONYMOUS">Anonymous</SelectItem>
						<SelectItem key="BOARD">Board</SelectItem>
						<SelectItem key="SECRETARIAT">Secretariat</SelectItem>
						<SelectItem key="NORMAL">Normal</SelectItem>
					</Select>
					<Textarea defaultValue={edit?.markdown} isRequired label="Markdown" size="lg" name="markdown" />
				</ModalBody>
				<ModalFooter>
					<Button type="submit" size="lg" form="main">
						Create
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export function DeleteModal() {
	const { data: session, status } = useSession();

	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	async function deleteAnnouncementHandler() {
		const res = await deleteGlobalAnnouncement(searchParams.get("delete"));
		if (res) toast(res);
		if (res.ok) {
			removeSearchParams({ add: "", edit: "", delete: "" }, router);
			router.refresh();
		}
	}

	return (
		<Modal
			scrollBehavior="inside"
			isOpen={searchParams.has("delete") && status === "authenticated" && authorize(session, [s.admins, s.sd])}
			onOpenChange={() => {
				removeSearchParams({ add: "", edit: "", delete: "" }, router);
				router.refresh();
			}}>
			<ModalContent>
				<ModalHeader>Are you sure?</ModalHeader>
				<ModalBody>This action will delete the announcement permamently.</ModalBody>
				<ModalFooter>
					<Button onPress={deleteAnnouncementHandler} color="danger" form="main" type="submit">
						Delete
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
