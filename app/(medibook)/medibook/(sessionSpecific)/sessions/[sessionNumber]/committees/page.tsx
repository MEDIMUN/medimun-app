import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";

import { Fragment } from "react";
import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { romanize } from "@/lib/romanize";

import { Badge } from "@/components/badge";
import { Divider } from "@/components/divider";
import { Link } from "@/components/link";
import Paginator from "@/components/pagination";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu, DropdownSection } from "@/components/dropdown";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";

const itemsPerPage = 10;

export default async function Component(props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const currentPage = parseInt(searchParams.page) || 1;
    const authSession = await auth();
    if (!authSession) return notFound();
    const isManagement = authorize(authSession, [s.management]);

    const [selectedSession, committees, totalItems] = await prisma
		.$transaction([
			prisma.session.findFirstOrThrow({ where: { number: params.sessionNumber } }),
			prisma.committee.findMany({
				where: {
					session: { number: params.sessionNumber },
					name: { contains: searchParams.search, mode: "insensitive" },
					...(isManagement ? {} : { isVisible: true }),
				},
				include: { chair: { include: { user: true } }, delegate: { include: { user: true } } },
				orderBy: [{ type: "asc" }, { name: "asc" }],
				skip: (currentPage - 1) * itemsPerPage,
				take: itemsPerPage,
			}),
			prisma.committee.count({ where: { session: { number: params.sessionNumber } } }),
		])
		.catch(notFound);

    const currentCommitteeIds = authSession?.user?.currentRoles
		.concat(authSession.user.pastRoles)
		.filter((role) => role.session == params.sessionNumber)
		.filter((role) => role.roleIdentifier == "chair" || role.roleIdentifier == "delegate")
		.map((role) => role.committeeId);

    committees.sort((a: any, b: any) => {
		if (currentCommitteeIds.includes(a.id) && !currentCommitteeIds.includes(b.id)) return -1;
		if (currentCommitteeIds.includes(b.id) && !currentCommitteeIds.includes(a.id)) return 1;
		return 0;
	});

    return (
		<>
			<TopBar
				buttonHref={`/medibook/sessions/${params.sessionNumber}`}
				buttonText={`Session ${romanize(selectedSession.numberInteger)}`}
				title="Committees">
				{isManagement && <SearchParamsButton searchParams={{ "create-committee": true }}>Create New</SearchParamsButton>}
			</TopBar>
			{!!committees.length && (
				<ul>
					{committees.map((committee, index) => {
						const chairs = committee?.chair;
						const chairsLength = chairs.length;
						const isInvolved = currentCommitteeIds.includes(committee.id);
						return (
							<>
								<li key={committee.id}>
									<Divider soft={index > 0} />
									<div className="flex items-center justify-between">
										<div key={committee.id} className="flex gap-6 py-6">
											<div className="w-32 shrink-0">
												<Link href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || committee.id}`} aria-hidden="true">
													<img
														className="aspect-[3/2] rounded-lg shadow"
														src={committee?.coverImage ? `/api/committees/${committee.id}/cover` : `/assets/gradients/${((index + 1) % 6) + 1}.jpg`}
														alt="Committee cover image."
													/>
												</Link>
											</div>
											<div className="space-y-1.5">
												<div className="text-base/6 font-semibold">
													<Link href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || committee.id}`}>
														{committee.name} {isInvolved && <Badge className="-translate-y-[2px]">My Committee</Badge>}{" "}
														{!committee.isVisible && (
															<Badge color="red" className="-translate-y-[2px]">
																Hidden
															</Badge>
														)}
													</Link>
												</div>
												<div className="text-xs/6 text-zinc-500">
													{!!chairsLength ? "Chaired by " : "No Chairs Assigned"}
													{chairs.map((chair: any, index: number) => {
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
											<Dropdown>
												<DropdownButton plain aria-label="More options">
													<EllipsisVerticalIcon />
												</DropdownButton>
												<DropdownMenu anchor="bottom end">
													<DropdownItem href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || committee.id}`}>
														View
													</DropdownItem>
													{isManagement && (
														<DropdownSection aria-label="Actions">
															<SearchParamsDropDropdownItem searchParams={{ "edit-committee": committee.id }}>Edit</SearchParamsDropDropdownItem>
															<SearchParamsDropDropdownItem searchParams={{ "delete-committee": committee.id }}>Delete</SearchParamsDropDropdownItem>
														</DropdownSection>
													)}
												</DropdownMenu>
											</Dropdown>
										</div>
									</div>
								</li>
							</>
						);
					})}
				</ul>
			)}
			<Paginator itemsOnPage={committees.length} itemsPerPage={itemsPerPage} totalItems={totalItems} />
		</>
	);
}
