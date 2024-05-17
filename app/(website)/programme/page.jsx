import Background from "@/components/website/Background";
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
import Image from "next/image";

export const metadata = {
	title: "Programme",
	description: "The conference programme for MEDIMUN XIX.",
};

export default async function Page() {
	const elId = Math.random().toString(36);
	return (
		<div className="bg-gray-100">
			<div className="mx-auto h-auto max-w-[1248px] p-5 pt-24 font-[montserrat] text-white">
				<h1 className="select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-black">Conference Programme</h1>
				<Spacer y={4} />
				<div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-3">
					<Card>
						<CardHeader className="ml-3 flex gap-3">
							<div className="flex flex-col">
								<p className="text-md">Day 1</p>
								<p className="text-small text-default-500">2 February 2024</p>
							</div>
						</CardHeader>
						<Divider />
						<CardBody className="flex flex-col">
							<p className="ml-3 font-bold">08:00 - 09:00</p>
							<p className="ml-3">Registration & delegation photos</p>
							<Divider className="my-1" />
							<div className="flex flex-col">
								<div>
									<p className="ml-3 font-bold">09:00 - 12:00</p>
									<p className="ml-3">Lobbying & resolution drafting</p>
								</div>
								<p className="ml-3 mt-2 font-medium">Breaks</p>
								<div className="my-1 rounded-2xl bg-gray-200 p-3">
									<div className="flex gap-2">
										<p className="mr-auto font-bold">10:00 - 10:30</p>
										GA1, GA2, & SC
									</div>
									<Divider className="my-1" />
									<div className="flex gap-2">
										<p className="mr-auto font-bold">10:30 - 11:00</p>
										GA3, GA4, CSW & HSC
									</div>
								</div>
							</div>
							<Divider className="my-1" />
							<p className="ml-3 font-bold">12:00 - 13:00</p>
							<p className="ml-3">Opening Ceremony</p>
							<Divider className="my-1" />
							<div className="flex flex-col">
								<div>
									<p className="ml-3 font-bold">13:00 - 16:00</p>
									<p className="ml-3">Lobbying & resolution drafting</p>
								</div>
								<p className="ml-3 mt-2 font-medium">Lunch</p>
								<div className="my-1 rounded-2xl bg-gray-200 p-3">
									<div className="flex gap-2">
										<p className="mr-auto font-bold">13:00 - 13:30</p>
										Members & Directors
									</div>
									<Divider className="my-1" />
									<div className="flex gap-2">
										<p className="mr-auto font-bold">13:30 - 14:00</p>
										GA1, GA2 & SC
									</div>
									<Divider className="my-1" />
									<div className="flex gap-2">
										<p className="mr-auto font-bold">14:00 - 14:30</p>
										GA3, GA4, CSW & HSC
									</div>
								</div>
								<p className="ml-3 mt-2 font-medium">Expert Speakers Q&A</p>
								<div className="my-1 rounded-2xl bg-gray-200 p-3">
									<div className="flex gap-2">
										<p className="mr-auto font-bold">15:00 - 15:30</p>
										Group 1
									</div>
									<Divider className="my-1" />
									<div className="flex gap-2">
										<p className="mr-auto font-bold">15:30 - 16:00</p>
										Group 2
									</div>
								</div>
							</div>
							<Divider className="my-1" />
							<p className="ml-3 font-bold">16:00 - 18:00</p>
							<p className="ml-3">Debate</p>
							<p className="ml-3 mt-2 font-medium">Breaks</p>
							<div className="my-1 rounded-2xl bg-gray-200 p-3">
								<div className="flex gap-2">
									<p className="mr-auto font-bold">16:00 - 16:30</p>
									GA1, GA2, & SC
								</div>
								<Divider className="my-1" />
								<div className="flex gap-2">
									<p className="mr-auto font-bold">16:30 - 17:00</p>
									GA3, GA4, CSW & HSC
								</div>
							</div>
							<Divider className="my-1" />
							<p className="ml-3 font-bold">18:00 - 18:30</p>
							<p className="ml-3">Departures</p>
						</CardBody>
					</Card>
					<Card>
						<CardHeader className="ml-3 flex gap-3">
							<div className="flex flex-col">
								<p className="text-md">Day 2</p>
								<p className="text-small text-default-500">3 February 2024</p>
							</div>
						</CardHeader>
						<Divider />
						<CardBody className="flex flex-col">
							<p className="ml-3 font-bold">08:00 - 09:00</p>
							<p className="ml-3">Arrivals & Conference Photo</p>
							<Divider className="my-1" />
							<div className="flex flex-col">
								<div>
									<p className="ml-3 font-bold">09:00 - 18:00</p>
									<p className="ml-3">Lobbying & resolution drafting</p>
								</div>
								<p className="ml-3 mt-2 font-medium">Breaks</p>
								<div className="my-1 rounded-2xl bg-gray-200 p-3">
									<div className="flex gap-2">
										<p className="mr-auto font-bold">10:00 - 10:30</p>
										GA1, GA2 & SC
									</div>
									<Divider className="my-1" />
									<div className="flex gap-2">
										<p className="mr-auto font-bold">10:30 - 11:00</p>
										GA3, GA4, HSC & CSW
									</div>
								</div>

								<p className="ml-3 mt-2 font-medium">Lunch</p>
								<div className="my-1 rounded-2xl bg-gray-200 p-3">
									<div className="flex gap-2">
										<p className="mr-auto font-bold">13:00 - 13:30</p>
										Members & Directors
									</div>
									<Divider className="my-1" />
									<div className="flex gap-2">
										<p className="mr-auto font-bold">13:30 - 14:00</p>
										GA1, GA2 & SC
									</div>
									<Divider className="my-1" />
									<div className="flex gap-2">
										<p className="mr-auto font-bold">14:00 - 14:30</p>
										GA3, GA4, HSC & CSW
									</div>
								</div>
								<p className="ml-3 mt-2 font-medium">Breaks</p>
								<div className="my-1 rounded-2xl bg-gray-200 p-3">
									<div className="flex gap-2">
										<p className="mr-auto font-bold">16:00 - 16:30</p>
										GA1, GA2, & SC
									</div>
									<Divider className="my-1" />
									<div className="flex gap-2">
										<p className="mr-auto font-bold">16:30 - 17:00</p>
										GA3, GA4, HSC & CSW
									</div>
								</div>
							</div>
							<Divider className="my-1" />
							<p className="ml-3 font-bold">18:00 - 18:30</p>
							<p className="ml-3">Departures</p>
						</CardBody>
						<Divider />
					</Card>
					<Card>
						<CardHeader className="flex gap-3">
							<div className="ml-3 flex flex-col">
								<p className="text-md">Day 3</p>
								<p className="text-small text-default-500">4 February 2024</p>
							</div>
						</CardHeader>
						<Divider />
						<CardBody className="flex flex-col">
							<p className="ml-3 font-bold">08:00 - 08:30</p>
							<p className="ml-3">Arrivals</p>
							<Divider className="my-1" />
							<p className="ml-3 font-bold">08:30 - 09:00</p>
							<p className="ml-3">Committee Time</p>
							<Divider className="my-1" />
							<p className="ml-3 font-bold">09:00 - 11:00</p>
							<p className="ml-3">Plenary Session</p>
							<Divider className="my-1" />
							<p className="ml-3 font-bold">11:00 - 11:45</p>
							<p className="ml-3">Break</p>
							<Divider className="my-1" />
							<p className="ml-3 font-bold">12:00 - 13:00</p>
							<p className="ml-3">Closing Ceremony</p>
						</CardBody>
						<Divider />
					</Card>
					{/* 					<Card className="flex flex-row justify-between gap-3 p-3 lg:col-span-3">
						<p>Download printable version of the timetable </p>
						<Chip href="" as={Link}>
							Coming Soon
						</Chip>
					</Card> */}
					<p className="ml-3 text-white">The programme is subject to change.</p>
				</div>
			</div>
		</div>
	);
}
