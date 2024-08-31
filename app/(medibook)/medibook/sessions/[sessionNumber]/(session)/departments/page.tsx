import { authorize, s } from "@/lib/authorize";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";
import { Fragment } from "react";
import { auth } from "@/auth";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { romanize } from "@/lib/romanize";
import { Divider } from "@/components/divider";
import { Badge } from "@/components/badge";
import Paginator from "@/components/Paginator";
import { DepartmentDropdown } from "./components";
import { Link } from "@/components/link";
import { parseOrderDirection } from "@/lib/orderDirection";

const itemsPerPage = 9;

const sortOptions = [
	{ value: "name", order: "asc", label: "Name", description: "Ascending" },
	{ value: "name", order: "desc", label: "Name", description: "Descending" },
	{ value: "shortName", order: "asc", label: "Short Name", description: "Ascending" },
	{ value: "shortName", order: "desc", label: "Short Name", description: "Descending" },
	{ value: "type", order: "asc", label: "Type", description: "Ascending" },
	{ value: "type", order: "desc", label: "Type", description: "Descending" },
];

export default async function Page({ params, searchParams }) {
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
			where: { session: { number: selectedSession.number }, name: { contains: searchParams.search, mode: "insensitive" } },
			include: { manager: { include: { user: true } }, member: { include: { user: true } } },
			orderBy: { [orderBy]: orderDirection },
			skip: (currentPage - 1) * itemsPerPage,
			take: itemsPerPage,
		})
		.catch(notFound);

	const currentDepartmentIds = [...authSession.currentRoles, ...authSession.pastRoles]
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
				{isManagement && <SearchParamsButton searchParams={{ createdepartment: "" }}>Create New</SearchParamsButton>}
			</TopBar>
			<ul className="mt-10">
				{sortedDepartments.map((department: any, index: number) => {
					const managers = department?.manager;
					const chairsLength = managers?.length;
					const isInvolved = currentDepartmentIds?.includes(department.id);
					return (
						<>
							<li key={department.id}>
								<Divider soft={index > 0} />
								<div className="flex items-center justify-between">
									<div key={department.id} className="flex gap-6 py-6">
										<div className="w-32 shrink-0">
											<Link href={`/medibook/sessions/${selectedSession?.number}/committees/${department?.slug || department.id}`} aria-hidden="true">
												<img
													className="aspect-[3/2] rounded-lg shadow"
													src={department?.cover ? `/api/departments/${department.id}/cover` : `/gradients/${((index + 1) % 6) + 1}.jpg`}
													alt="Committee cover image."
												/>
											</Link>
										</div>
										<div className="space-y-1.5">
											<div className="text-base/6 font-semibold">
												<Link href={`/medibook/sessions/${selectedSession?.number}/committees/${department?.slug || department.id}`}>
													{department.name} {isInvolved && <Badge className="-translate-y-[2px]">My Department</Badge>}
												</Link>
											</div>
											<div className="text-xs/6 text-zinc-500">
												{!!chairsLength ? "Overseen by " : "No Chairs Assigned"}
												{managers.map((chair: any, index: number) => {
													const user = chair?.user;
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
										<DepartmentDropdown department={department} isManagement={isManagement} params={params} />
									</div>
								</div>
							</li>
						</>
					);
				})}
			</ul>
			<Paginator itemsPerPage={itemsPerPage} totalItems={totalItems} />
		</>
	);
}
