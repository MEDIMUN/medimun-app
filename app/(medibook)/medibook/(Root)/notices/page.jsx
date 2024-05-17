import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
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
import Modal, { DeleteModal } from "./Modal";
import PinButton from "./pinButton";
import * as SolarIconSet from "solar-icon-set";
import Paginator from "@/components/Paginator";

export default async function Page({ params, searchParams }) {
	const announcementsPerPage = 9;
	const page = searchParams.page || 1;
	const session = await getServerSession(authOptions);
	const query = searchParams.search || "";
	const globalAnnouncements = await prisma.announcement.findMany({
		orderBy: [{ isPinned: "desc" }, { time: "asc" }],
		where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { markdown: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] },
		include: { User: { select: { officialName: true, id: true, displayName: true, officialSurname: true } } },
		skip: (page - 1) * announcementsPerPage,
		take: announcementsPerPage,
	});
	const total = await prisma.announcement.count({});
	let edit = {};
	if (searchParams.edit)
		edit = await prisma.globalAnnouncement.findUnique({
			where: { id: searchParams.edit },
		});
	return (
		<>
			<DeleteModal />
			<Modal edit={edit} />
			{globalAnnouncements.map((announcement) => {
				const isEdited = announcement.editTime.toString() !== announcement.time.toString();
				const isBoard = announcement.privacy === "BOARD";
				const isSecretariat = announcement.privacy === "SECRETARIAT";
				const isAnonymous = announcement.privacy === "ANONYMOUS";
				return (
					<Card key={announcement.id} className={`h-[200px] ${announcement.isPinned && "shadow-md shadow-slate-400"}`}>
						<CardHeader as={Link} href={"announcements/" + announcement.id} className="flex flex-col text-ellipsis">
							<p className="mr-auto line-clamp-1 text-ellipsis text-xl">
								{announcement.isPinned && "📌 "}
								{announcement.title}
							</p>
							<p className="mr-auto line-clamp-2 max-w-full text-ellipsis text-sm">{announcement.description}</p>
							<div className="mr-auto mt-2 flex flex-row gap-2 text-xs text-slate-500">
								{isEdited && <p>Edited</p>}
								{announcement.editTime.toLocaleString().replace(", ", " • ")}
								{isBoard && <p>• by the Board</p>}
								{isSecretariat && <p>• by the Secretariat</p>}
								{isAnonymous && <p>• Anonymous</p>}
							</div>
						</CardHeader>
						<CardBody as={Link} href={"announcements/" + announcement.id} />
						<CardFooter className="flex flex-row gap-2 bg-gray-100">
							{announcement.privacy !== "ANONYMOUS" && <User name={announcement.user.displayName || announcement.user.officialName + " " + announcement.user.officialSurname} avatarProps={{ src: `/api/users/${announcement.user.id}/avatar`, size: "sm", isBordered: true, name: announcement.user.officialName[0] + announcement.user.officialSurname[0], showFallback: true, color: "primary", className: "min-w-max" }} />}
							<div className="ml-auto flex gap-2">
								<ButtonGroup>
									{authorize(session, [s.management]) && (
										<>
											<Button color="danger" as={Link} isIconOnly href={"?delete=" + announcement.id} className="bgn ml-auto">
												<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" size={24} />
											</Button>
											<Button isIconOnly as={Link} href={"?edit=" + announcement.id} className="ml-auto">
												<SolarIconSet.GalleryEdit iconStyle="Outline" size={24} />
											</Button>
											<PinButton isPinned={announcement.isPinned} announcementId={announcement.id} />
										</>
									)}
									<Button as={Link} isIconOnly href={"announcements/" + announcement.id} className="bgn ml-auto">
										<SolarIconSet.Eye iconStyle="Outline" size={24} />
									</Button>
								</ButtonGroup>
							</div>
						</CardFooter>
					</Card>
				);
			})}
			{!!total && <Paginator total={Math.ceil(total / announcementsPerPage)} />}
		</>
	);
}
