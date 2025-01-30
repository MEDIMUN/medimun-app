import { authorize, s } from "@/lib/authorize";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";
import { Fragment } from "react";
import { auth } from "@/auth";
import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { romanize } from "@/lib/romanize";
import { Divider } from "@/components/divider";
import { Badge } from "@/components/badge";
import Paginator from "@/components/pagination";
import { Link } from "@/components/link";
import { parseOrderDirection } from "@/lib/order-direction";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu, DropdownSection } from "@/components/dropdown";
import { Ellipsis } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";

const itemsPerPage = 9;

const sortOptions = [
	{ value: "name", order: "asc", label: "Name" },
	{ value: "name", order: "desc", label: "Name" },
	{ value: "shortName", order: "asc", label: "Short Name" },
	{ value: "shortName", order: "desc", label: "Short Name" },
	{ value: "type", order: "asc", label: "Type" },
	{ value: "type", order: "desc", label: "Type" },
];

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const currentPage = searchParams.page || 1;
	//
	const orderBy = searchParams.order || "name";
	const orderDirection = parseOrderDirection(searchParams.direction);
	//
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	//
	const selectedSession = await prisma.session.findFirstOrThrow({ where: { number: params.sessionNumber } }).catch(notFound);
	const totalItems = await prisma.department.count({ where: { session: { number: selectedSession.number } } }).catch(notFound);

	const prismaDepartments = await prisma.department
		.findMany({
			where: {
				session: { number: selectedSession.number },
				...(isManagement ? {} : { isVisible: true }),
				name: { contains: searchParams.search, mode: "insensitive" },
			},
			include: { manager: { include: { user: true } }, member: { include: { user: true } } },
			orderBy: { [orderBy]: orderDirection },

			skip: (currentPage - 1) * itemsPerPage,
			take: itemsPerPage,
		})
		.catch(notFound);

	const currentDepartmentIds = authSession.user.currentRoles
		.concat(authSession.user.pastRoles)
		.filter((role) => role.session == selectedSession.number)
		.filter((role) => role.roleIdentifier == "manager" || role.roleIdentifier == "member")
		.map((role) => role.departmentId);

	const sortedDepartments = prismaDepartments.sort((a: any, b: any) => {
		if (currentDepartmentIds.includes(a.id) && !currentDepartmentIds.includes(b.id)) return -1;
		if (currentDepartmentIds.includes(b.id) && !currentDepartmentIds.includes(a.id)) return 1;
		return 0;
	});

	return (
		<>
			<TopBar
				defaultSort="nameasc"
				sortOptions={sortOptions}
				buttonHref={`/medibook/sessions/${selectedSession.number}`}
				buttonText={`Session ${romanize(selectedSession.numberInteger)}`}
				title="Departments">
				{isManagement && <SearchParamsButton searchParams={{ "create-department": true }}>Create New</SearchParamsButton>}
			</TopBar>
			<MainWrapper>
				{!!prismaDepartments.length && (
					<ul>
						{sortedDepartments.map((department: any, index: number) => {
							const managers = department?.manager;
							const chairsLength = managers?.length;
							const isInvolved = currentDepartmentIds?.includes(department.id);
							return (
								<Fragment key={department.id}>
									<li key={department.id}>
										<Divider soft={index > 0} />
										<div className="flex items-center justify-between">
											<div key={department.id} className="flex gap-6 py-6">
												<div className="space-y-1.5">
													<div className="text-base/6 font-semibold">
														<Link href={`/medibook/sessions/${selectedSession?.number}/departments/${department?.slug || department.id}`}>
															{department.name} {isInvolved && <Badge className="-translate-y-[2px]">My Department</Badge>}
															{!department.isVisible && (
																<Badge color="red" className="-translate-y-[2px]">
																	Hidden
																</Badge>
															)}
														</Link>
													</div>
													<div className="text-xs/6 text-zinc-500">
														{!!chairsLength ? "Overseen by " : "No Managers Assigned"}
														{managers.map((manager: any, index: number) => {
															const user = manager?.user;
															const displayNameShortened =
																user?.displayName?.split(" ").length == 1
																	? user?.displayName
																	: user?.displayName?.split(" ")[0] + " " + user?.displayName?.split(" ")[1][0] + ".";
															const fullName = user?.displayName
																? displayNameShortened
																: user?.officialName.split(" ")[0] + " " + user?.officialSurname[0] + ".";
															return (
																<Fragment key={index}>
																	{fullName}
																	{chairsLength - 1! > index + 1 && ", "}
																	{chairsLength - 1 == index + 1 && " & "}
																</Fragment>
															);
														})}
													</div>
												</div>
											</div>
											<div className="flex items-center gap-4">
												<Dropdown>
													<DropdownButton plain aria-label="More options">
														<Ellipsis width={18} />
													</DropdownButton>
													<DropdownMenu anchor="bottom end">
														<DropdownItem href={`/medibook/sessions/${params.sessionNumber}/departments/${department.slug || department.id}`}>
															View
														</DropdownItem>
														{isManagement && (
															<DropdownSection>
																<SearchParamsDropDropdownItem searchParams={{ "edit-department": department.id }}>Edit</SearchParamsDropDropdownItem>
																<SearchParamsDropDropdownItem searchParams={{ "delete-department": department.id }}>
																	Delete
																</SearchParamsDropDropdownItem>
															</DropdownSection>
														)}
													</DropdownMenu>
												</Dropdown>
											</div>
										</div>
									</li>
								</Fragment>
							);
						})}
					</ul>
				)}
				<Paginator itemsOnPage={sortedDepartments.length} itemsPerPage={itemsPerPage} totalItems={totalItems} />
			</MainWrapper>
		</>
	);
}
