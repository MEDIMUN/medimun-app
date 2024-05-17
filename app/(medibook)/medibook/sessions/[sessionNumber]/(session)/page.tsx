import prisma from "@/prisma/client";
import { getOrdinal } from "@/lib/get-ordinal";
import Drawer from "./Drawer";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { authorize, s } from "@/lib/authorize";
import { notFound } from "next/navigation";
import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Autocomplete, AutocompleteSection, AutocompleteItem } from "@nextui-org/autocomplete";
import { Badge } from "@nextui-org/badge";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { CircularProgress } from "@nextui-org/progress";
import { Code } from "@nextui-org/code";
import { Divider } from "@nextui-org/divider";
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
import { capitaliseEachWord } from "@/lib/capitaliseEachWord";
import DepartmentDrawer from "./DepartmentDrawer";
import { Image } from "@nextui-org/image";
export const revalidate = 60;

export async function generateMetadata({ params }) {
	const sessionNumber = params.sessionNumber;
	const ordinal = getOrdinal(params.sessionNumber);
	return { title: `${sessionNumber + ordinal} Annual Session - MediBook`, description: `${sessionNumber + ordinal} Annual Session of the Mediterranean Model United Nations` };
}

async function getSessionData(params) {
	return await prisma.session.findFirstOrThrow({ where: { number: params.sessionNumber } });
}

export default async function Page({ params, searchParams }) {
	let session = getServerSession(authOptions),
		selectedSession = getSessionData(params);
	[session, selectedSession] = await Promise.all([session, selectedSession]);

	const numberOfDelegates = await prisma.delegate.count({
		where: {
			committee: {
				session: {
					number: params.sessionNumber,
				},
			},
		},
	});

	const numberOfMembers = await prisma.member.count({
		where: {
			department: {
				session: {
					number: params.sessionNumber,
				},
			},
		},
	});

	const latestSessionAnnouncements = await prisma.announcement.findMany({
		where: {
			Session: {
				number: params.sessionNumber,
			},
		},
		orderBy: {
			time: "desc",
		},
		take: 3,
		select: {
			id: true,
			title: true,
			markdown: true,
			time: true,
		},
	});

	let numberOfNationalities = await prisma.delegate.findMany({
		where: {
			committee: {
				session: {
					number: params.sessionNumber,
				},
			},
		},
		select: {
			user: {
				select: {
					nationality: true,
				},
			},
		},
	});

	const ordinal = getOrdinal(selectedSession?.number);

	return (
		<>
			<Drawer selectedSession={selectedSession} />
			<DepartmentDrawer props={params} />
			<div className="grid grid-cols-12 grid-rows-2 gap-4">
				<Card className="col-span-12 h-[300px] sm:col-span-4">
					<CardHeader className="absolute top-1 z-10 flex-col !items-start">
						<p className="text-tiny font-bold uppercase text-black/60">COMMITTEES</p>
						<h4 className="text-large font-medium text-black">Stream the Acme event</h4>
					</CardHeader>
					<Image removeWrapper alt="Card background" className="z-0 h-full w-full object-cover" src="/assets/committee-1.jpg" />
					<CardFooter className="absolute bottom-0 z-10 border-t-1 border-default-600 bg-black/80 dark:border-default-100">
						<div className="flex flex-grow items-center gap-2">
							<div className="flex flex-col">
								<p className="text-tiny text-white/60">Explore all</p>
								<p className="text-tiny text-white/60">committees & topics.</p>
							</div>
						</div>
						<Button size="sm">Explore</Button>
					</CardFooter>
				</Card>
				<Card className="col-span-12 h-[300px] sm:col-span-4">
					<CardHeader className="absolute top-1 z-10 flex-col !items-start">
						<p className="text-tiny font-bold uppercase text-white/60">Plant a tree</p>
						<h4 className="text-large font-medium text-white">Contribute to the planet</h4>
					</CardHeader>
					<Image removeWrapper alt="Card background" className="z-0 h-full w-full object-cover" src="https://nextui.org//images/card-example-3.jpeg" />
				</Card>
				<Card className="col-span-12 h-[300px] sm:col-span-4">
					<CardHeader className="absolute top-1 z-10 flex-col !items-start">
						<p className="text-tiny font-bold uppercase text-white/60">Supercharged</p>
						<h4 className="text-large font-medium text-white">Creates beauty like a beast</h4>
					</CardHeader>
					<Image removeWrapper alt="Card background" className="z-0 h-full w-full object-cover" src="https://nextui.org//images/card-example-2.jpeg" />
				</Card>
				<Card isFooterBlurred className="col-span-12 h-[300px] w-full sm:col-span-5">
					<CardHeader className="absolute top-1 z-10 flex-col items-start">
						<p className="text-tiny font-bold uppercase text-white/60">New</p>
						<h4 className="text-2xl font-medium text-black">Acme camera</h4>
					</CardHeader>
					<Image removeWrapper alt="Card example background" className="z-0 h-full w-full -translate-y-6 scale-125 object-cover" src="https://nextui.org//images/card-example-6.jpeg" />
					<CardFooter className="absolute bottom-0 z-10 justify-between border-t-1 border-zinc-100/50 bg-white/30">
						<div>
							<p className="text-tiny text-black">Available soon.</p>
							<p className="text-tiny text-black">Get notified.</p>
						</div>
						<Button className="text-tiny" color="primary" radius="full" size="sm">
							Notify Me
						</Button>
					</CardFooter>
				</Card>
				<Card isFooterBlurred className="col-span-12 h-[300px] w-full sm:col-span-7">
					<CardHeader className="absolute top-1 z-10 flex-col items-start">
						<p className="text-tiny font-bold uppercase text-white/60">Your day your way</p>
						<h4 className="text-xl font-medium text-white/90">Your checklist for better sleep</h4>
					</CardHeader>
					<Image removeWrapper alt="Relaxing app background" className="z-0 h-full w-full object-cover" src="https://nextui.org//images/card-example-5.jpeg" />
					<CardFooter className="absolute bottom-0 z-10 border-t-1 border-default-600 bg-black/40 dark:border-default-100">
						<div className="flex flex-grow items-center gap-2">
							<Image alt="Breathing app icon" className="h-11 w-10 rounded-full bg-black" src="https://nextui.org/images/breathing-app-icon.jpeg" />
							<div className="flex flex-col">
								<p className="text-tiny text-white/60">Breathing App</p>
								<p className="text-tiny text-white/60">Get a good night's sleep.</p>
							</div>
						</div>
						<Button radius="full" size="sm">
							Get App
						</Button>
					</CardFooter>
				</Card>
			</div>
		</>
	);
}
