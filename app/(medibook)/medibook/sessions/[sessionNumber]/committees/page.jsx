import { TopBar } from "@/components/medibook/TopBar";
import { Frame } from "@/components/medibook/Frame";
import { Card, CardHeader, CardBody, AvatarGroup, CardFooter, Divider, Link, Chip, Image, ButtonGroup, Button } from "@nextui-org/react";
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
	const committeesPerPage = 9;
	const page = searchParams.page || 1;
	const commmittees = await prisma.committee
		.findMany({
			where: { AND: [{ session: { number: params.sessionNumber } }, { OR: [{ name: { contains: searchParams.query, mode: "insensitive" } }, { description: { contains: searchParams.query, mode: "insensitive" } }] }] },
			include: {
				chair: {
					include: {
						user: true,
					},
				},
				delegate: {
					include: {
						user: true,
					},
				},
			},
			orderBy: [{ name: "asc" }],
			skip: (page - 1) * committeesPerPage,
			take: committeesPerPage,
		})
		.catch(notFound);
	const total = await prisma.committee
		.count({
			where: { AND: [{ session: { number: params.sessionNumber } }, { OR: [{ name: { contains: searchParams.query, mode: "insensitive" } }, { description: { contains: searchParams.query, mode: "insensitive" } }] }] },
		})
		.catch(notFound);
	const edit = await prisma.committee.findFirst({ where: { id: searchParams.edit || "" } }).catch(notFound);
	const session = await getServerSession(authOptions);
	return (
		<>
			<Modal edit={edit} sessionNumber={params.sessionNumber} />
			<DeleteModal />
			<TopBar title="Committees">
				{authorize(session, [s.management]) && (
					<Button as={Link} href="?add">
						Add Committee
					</Button>
				)}
			</TopBar>
			<Frame topContent={<SearchBar />} isGrid>
				{commmittees.map((committee) => {
					const committeeNameMap = {
						GENERALASSEMBLY: "General Assembly",
						SPECIALCOMMITTEE: "Special Committee",
						SECURITYCOUNCIL: "Security Council",
					};
					return (
						<Card key={committee.id} className={`h-[210px] ${false && "shadow-md shadow-slate-400"}`}>
							<CardHeader>
								<div className="flex flex-col align-middle">
									{committee.shortName && (
										<h2 className={`${session.isCurrent ? "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" : "bg-black"} my-auto mr-3 flex h-[40px] w-[40px] justify-center rounded-xl px-3 align-middle text-[18px] text-white shadow-xl`}>
											<span className="my-auto font-thin">{committee.shortName}</span>
										</h2>
									)}
									<div className="mt-[6px] leading-[20px]">
										<div>
											<p className="text-large font-medium text-black">{committee.name}</p>
											<Tooltip
												content={
													<>
														{committee.topic1}
														<br />
														{committee.topic2}
														<br />
														{committee.topic3}
													</>
												}>
												<h4 className="line-clamp-3 cursor-pointer text-tiny font-bold text-black/60">
													{committee.topic1}
													{committee.topic2 && ", "}
													{committee.topic2}
													{committee.topic3 && ", "}
													{committee.topic3}
												</h4>
											</Tooltip>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardFooter className="bottom-0 mt-auto flex flex-row gap-2 bg-gray-100">
								<div className="ml-auto flex gap-2">
									<AvatarGroup max={4} size="sm" isBordered>
										{[...committee.chair, ...committee.delegate].map(({ user, index }) => {
											const name = user.officialName[0] + user.officialSurname[0];
											return <Avatar showFallback name={name} key={user.id} src={`/api/user/${user.id}/profilePicture`} />;
										})}
									</AvatarGroup>
									<ButtonGroup>
										{authorize(session, [s.management, s.sec]) && (
											<>
												<Button color="danger" as={Link} isIconOnly href={"?delete=" + committee.id} className="bgn ml-auto">
													<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" size={24} />
												</Button>
												<Button isIconOnly as={Link} href={"?edit=" + committee.id} className="ml-auto">
													<SolarIconSet.GalleryEdit iconStyle="Outline" size={24} />
												</Button>
											</>
										)}
										<Button as={Link} isIconOnly href={"/" + committee.id} className="bgn ml-auto">
											<SolarIconSet.Eye iconStyle="Outline" size={24} />
										</Button>
									</ButtonGroup>
								</div>
							</CardFooter>
						</Card>
					);
				})}
				<Paginator page={searchParams.page || 1} total={Math.ceil(total / committeesPerPage)} />
			</Frame>
		</>
	);
}
