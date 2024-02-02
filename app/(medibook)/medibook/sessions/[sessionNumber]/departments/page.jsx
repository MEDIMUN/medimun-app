import { TopBar } from "@/components/medibook/TopBar";
import { Frame } from "@/components/medibook/Frame";
import { Card, CardHeader, CardBody, AvatarGroup, CardFooter, Avatar, Divider, Link, Chip, Image, ButtonGroup, Button } from "@nextui-org/react";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as SolarIconSet from "solar-icon-set";
import { notFound } from "next/navigation";
import Modal, { DeleteModal } from "./Modal";
import prisma from "@/prisma/client";
import SearchBar from "./SearchBar";
import Paginator from "../../../(Root)/notices/Paginator";
import { Tooltip } from "@nextui-org/react";

export default async function Page({ params, searchParams }) {
	const departmentsPerPage = 9;
	const page = searchParams.page || 1;
	const commmittees = await prisma.department
		.findMany({
			where: { AND: [{ session: { number: params.sessionNumber } }, { OR: [{ name: { contains: searchParams.query, mode: "insensitive" } }, { description: { contains: searchParams.query, mode: "insensitive" } }] }] },
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
			skip: (page - 1) * departmentsPerPage,
			take: departmentsPerPage,
		})
		.catch(notFound);
	const total = await prisma.department
		.count({
			where: { AND: [{ session: { number: params.sessionNumber } }, { OR: [{ name: { contains: searchParams.query, mode: "insensitive" } }, { description: { contains: searchParams.query, mode: "insensitive" } }] }] },
		})
		.catch(notFound);
	const edit = await prisma.department.findFirst({ where: { id: searchParams.edit || "" } }).catch(notFound);
	const session = await getServerSession(authOptions);
	return (
		<>
			<Modal edit={edit} sessionNumber={params.sessionNumber} />
			<DeleteModal />
			<TopBar title="Departments">
				{authorize(session, [s.management]) && (
					<Button as={Link} href="?add">
						Add Department
					</Button>
				)}
			</TopBar>
			<Frame topContent={<SearchBar />} isGrid>
				{commmittees.map((department) => {
					return (
						<Card key={department.id} className={`h-[210px] ${false && "shadow-md shadow-slate-400"}`}>
							<CardHeader>
								<div className="flex flex-col align-middle">
									{department && (
										<h2 className={`${session.isCurrent ? "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" : "bg-black"} my-auto mr-3 flex h-[40px] w-[40px] justify-center rounded-xl px-3 align-middle text-[18px] text-white shadow-xl`}>
											<span className="my-auto font-thin">{department.shortName}</span>
										</h2>
									)}
									<div className="mt-[6px] leading-[20px]">
										<div>{department.name}</div>
									</div>
								</div>
							</CardHeader>
							<CardFooter className="bottom-0 mt-auto flex flex-row  gap-2 bg-gray-100">
								<div className="ml-auto flex w-full justify-stretch gap-2">
									<AvatarGroup max={4} size="sm" isBordered>
										{[...department.manager, ...department.member].map(({ user, index }) => {
											const name = user.officialName[0] + user.officialSurname[0];
											return <Avatar showFallback name={name} key={user.id} src={`/api/user/${user.id}/profilePicture`} />;
										})}
									</AvatarGroup>
									<ButtonGroup className="ml-auto">
										{authorize(session, [s.management, s.sec]) && (
											<>
												<Button color="danger" as={Link} isIconOnly href={"?delete=" + department.id} className="bgn ml-auto">
													<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" size={24} />
												</Button>
												<Button isIconOnly as={Link} href={"?edit=" + department.id} className="ml-auto">
													<SolarIconSet.GalleryEdit iconStyle="Outline" size={24} />
												</Button>
											</>
										)}
										<Button isDisabled as={Link} isIconOnly href={"/" + department.id} className="bgn ml-auto">
											<SolarIconSet.Eye iconStyle="Outline" size={24} />
										</Button>
									</ButtonGroup>
								</div>
							</CardFooter>
						</Card>
					);
				})}
				<Paginator page={searchParams.page || 1} total={Math.ceil(total / departmentsPerPage)} />
			</Frame>
		</>
	);
}
