import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Drawer from "./Drawer";
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
import { authorize, s } from "@/lib/authorize";
import PinButton from "./PinButton";
const announcementsPerPage = 10;
import Paginator from "./Paginator";

export default async function Page({ params, searchParams }) {
	const session = await getServerSession(authOptions);
	const { announcements, committee, announcementsCount } = await getData({ params, searchParams });
	const pinnedAnnouncements = announcements.filter((a) => a.isPinned);
	const normalAnnouncements = announcements.filter((a) => !a.isPinned);
	return (
		<>
			{<Drawer props={{ committeeId: committee.id, sessionNumber: params.sessionNumber, committeeSlug: committee.slug }} />}
			<div className="mx-auto flex max-w-[1248px] flex-col gap-6 p-6">
				{!!pinnedAnnouncements.length && (
					<>
						<p>Pinned Announcements</p>
						<ul className="grid w-full gap-4 md:grid-cols-2">
							{pinnedAnnouncements.map((announcement, index) => {
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
											<p className="mr-auto line-clamp-2 text-ellipsis text-sm">{announcement.description}</p>
											<div className="mr-auto mt-2 flex flex-row gap-2 text-xs text-slate-500">
												{isEdited && <p>Edited</p>}
												{announcement.editTime.toLocaleString().replace(", ", " • ")}
												{isBoard && <p>Announcement by the Board</p>}
												{isSecretariat && <p>Announcement by the Secretariat</p>}
												{isAnonymous && <p>Anonymous</p>}
											</div>
										</CardHeader>
										<CardBody as={Link} href={"announcements/" + announcement.id} />
										<CardFooter className="flex flex-row gap-2 bg-gray-100">
											{announcement.privacy !== "ANONYMOUS" && <User name={announcement.user.displayName || announcement.user.officialName + " " + announcement.user.officialSurname} avatarProps={{ src: `/api/user/${announcement.user.id}/profilePicture`, size: "sm", isBordered: true, name: announcement.user.officialName[0] + announcement.user.officialSurname[0], showFallback: true, color: "primary", className: "min-w-max" }} />}
											<div className="ml-auto flex gap-2">
												{authorize(session, [s.management]) && (
													<>
														<PinButton isPinned={announcement.isPinned} announcementId={announcement.id} />
														<Button as={Link} href={"announcements/" + announcement.id + "?edit&saveurl=./"} className="ml-auto">
															Edit
														</Button>
													</>
												)}
												<Button as={Link} href={"announcements/" + announcement.id} className="bgn ml-auto">
													View
												</Button>
											</div>
										</CardFooter>
									</Card>
								);
							})}
						</ul>
					</>
				)}
				{!!pinnedAnnouncements.length && <p>Normal Announcements</p>}
				<ul className="mb-[150px] grid w-full gap-4 md:grid-cols-2">
					{normalAnnouncements.map((announcement, index) => {
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
									<p className="mr-auto line-clamp-2 text-ellipsis text-sm">{announcement.description}</p>
									<div className="mr-auto mt-2 flex flex-row gap-2 text-xs text-slate-500">
										{isEdited && <p>Edited</p>}
										{announcement.editTime.toLocaleString().replace(", ", " • ")}
										{isBoard && <p>Announcement by the Board</p>}
										{isSecretariat && <p>Announcement by the Secretariat</p>}
										{isAnonymous && <p>Anonymous</p>}
									</div>
								</CardHeader>
								<CardBody as={Link} href={"announcements/" + announcement.id} />
								<CardFooter className="flex flex-row gap-2 bg-gray-100">
									{announcement.privacy !== "ANONYMOUS" && <User name={announcement.user.displayName || announcement.user.officialName + " " + announcement.user.officialSurname} avatarProps={{ src: `/api/user/${announcement.user.id}/profilePicture`, size: "sm", isBordered: true, name: announcement.user.officialName[0] + announcement.user.officialSurname[0], showFallback: true, color: "primary", className: "min-w-max" }} />}
									<div className="ml-auto flex gap-2">
										{authorize(session, [s.management]) && (
											<>
												<PinButton isPinned={announcement.isPinned} announcementId={announcement.id} />
												<Button as={Link} href={"announcements/" + announcement.id + "?edit&saveurl=./"} className="ml-auto">
													Edit
												</Button>
											</>
										)}
										<Button as={Link} href={"announcements/" + announcement.id} className="bgn ml-auto">
											View
										</Button>
									</div>
								</CardFooter>
							</Card>
						);
					})}
				</ul>
				{announcementsCount > announcementsPerPage && <Paginator total={Math.ceil(announcementsCount / announcementsPerPage)} />}
			</div>
		</>
	);
}

async function getData({ params, searchParams }) {
	let announcements = prisma.committeeAnnouncement
			.findMany({
				where: { OR: [{ committeeId: params.committeeId }, { committee: { slug: params.committeeId } }] },
				orderBy: [{ isPinned: "desc" }, { editTime: "desc" }],
				skip: parseInt(announcementsPerPage) * (searchParams.page - 1) || 0,
				take: parseInt(announcementsPerPage) || 10,
				include: { user: { select: { officialName: true, officialSurname: true, displayName: true, id: true } } },
			})
			.catch(),
		committee = prisma.committee
			.findFirst({
				where: {
					OR: [{ slug: params.committeeId }, { id: params.committeeId }],
					session: {
						number: params.sessionNumber,
					},
				},
			})
			.catch(),
		announcementsCount = prisma.committeeAnnouncement.count({ where: { OR: [{ committeeId: params.committeeId }, { committee: { slug: params.committeeId } }] } });
	[announcements, committee, announcementsCount] = await Promise.all([announcements, committee, announcementsCount]);
	if (!committee) return notFound();
	return { announcements, committee, announcementsCount };
}
