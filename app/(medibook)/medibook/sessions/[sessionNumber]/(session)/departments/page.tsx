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
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as SolarIconSet from "solar-icon-set";
import { notFound } from "next/navigation";
import AddModal, { DeleteModal } from "./modals";
import prisma from "@/prisma/client";
import Paginator from "../../../../../../../components/Paginator";
import SecondaryNavbar from "@/components/medibook/SecondaryNavbar";
import { Tooltip } from "@nextui-org/tooltip";
import Icon from "@/components/icon";
import { Suspense } from "react";
import { EditCommitteeButton } from "./buttons";
import { departmentTypes } from "@/constants";
import SearchBar from "../resources/SearchBar";

export default async function Page({ params, searchParams }) {
	const departmentsPerPage = 9;
	const currentPage = searchParams.page || 1;

	let departments: any, edit: any, session: any;

	session = getServerSession(authOptions as any);

	if (searchParams.edit) {
		edit = prisma.department.findFirst({ where: { id: searchParams.edit || "" } }).catch(notFound);
	} else {
		edit = Promise.resolve(null);
	}

	departments = prisma.department
		.findMany({
			where: { session: { number: params.sessionNumber }, name: { contains: searchParams.search, mode: "insensitive" } },
			include: {
				manager: {
					include: {
						user: true,
					},
				},
				member: {
					include: {
						user: true,
					},
				},
			},
			orderBy: [{ name: "asc" }],
			skip: (currentPage - 1) * departmentsPerPage,
			take: departmentsPerPage,
		})
		.catch(notFound);

	[departments as any, edit as any, session] = await Promise.all([departments, edit, session]);

	const currentDepartmentIds = [...session.currentRoles, ...session.pastRoles]
		.filter((role) => role.session == params.sessionNumber)
		.filter((role) => role.name == "Manager" || role.name == "Member")
		.map((role) => role.departmentId);

	departments = departments.sort((a: any, b: any) => {
		if (currentDepartmentIds.includes(a.id) && !currentDepartmentIds.includes(b.id)) return -1;
		if (currentDepartmentIds.includes(b.id) && !currentDepartmentIds.includes(a.id)) return 1;
		return 0;
	});

	const total = await prisma.department
		.count({
			where: {
				session: { number: params.sessionNumber },
			},
		})
		.catch(notFound);

	return (
		<>
			<AddModal edit={edit} sessionNumber={params.sessionNumber} />
			<DeleteModal />
			<ul className="flex w-full grid-cols-3 flex-wrap gap-4 ">
				{(departments as any).map((department: any, index: number) => {
					const manager = department?.manager;
					return (
						<li key={index} className={`-border flex w-full flex-col gap-2 rounded-xl border-black/10 bg-content1/60 p-4 dark:border-white/20 md:flex-row ${currentDepartmentIds.includes(department.id) && "mt-3"}`}>
							{currentDepartmentIds.includes(department.id) && <p className="-border absolute mt-[-26px] max-h-[20px] min-w-max max-w-max rounded-full border-black/10 bg-primary px-2 py-[1.5px] text-xs font-medium text-white dark:border-white/20">My Department</p>}
							<div className="flex flex-col gap-1">
								<div className="mb-[-10px] line-clamp-4 flex gap-2 bg-gradient-to-br from-foreground-800 to-foreground-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent dark:to-foreground-200">
									<p>{department.name} Department</p>
								</div>
								<p className="mt-1 line-clamp-2 text-default-400">
									{!manager.length && departmentTypes[department.type]}
									{!!manager.length && "Managed by "}
									{manager.map((manager: any, index: number) => {
										const user = manager?.user;
										const fullName = user?.displayName || user?.officialName + " " + user?.officialSurname || "";
										return (
											<span key={index}>
												{fullName}
												{department?.manager?.length - 1! > index + 1 && ", "}
												{department?.manager?.length - 1 == index + 1 && " & "}
											</span>
										);
									})}
								</p>
							</div>
							<div className="flex gap-2 md:ml-auto md:flex-row-reverse">
								<Tooltip content="View Committee">
									<Button endContent={<Icon icon="solar:arrow-right-outline" width={20} />} as={Link} href={`/medibook/sessions/${params.sessionNumber}/departments/${department.slug || department.id}`} fullWidth className="-border-small my-auto border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10 md:w-full">
										View
									</Button>
								</Tooltip>
								{authorize(session, [s.management]) && (
									<Tooltip content="Edit Committee">
										<EditCommitteeButton committeeId={department.id} />
									</Tooltip>
								)}
							</div>
						</li>
					);
				})}
			</ul>
			<div className="mx-auto mt-auto">
				<Suspense fallback={<Paginator page={1} total={1} />}>
					<Paginator page={currentPage} total={Math.ceil((total as number) / departmentsPerPage)} />
				</Suspense>
			</div>
		</>
	);
}
