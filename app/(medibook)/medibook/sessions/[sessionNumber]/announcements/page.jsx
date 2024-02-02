import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TopBar } from "@/components/medibook/TopBar";
import { Frame } from "@/components/medibook/Frame";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { Button } from "@nextui-org/react";
import prisma from "@/prisma/client";
import { Card, CardHeader, CardBody, Avatar, Divider, CardFooter, ButtonGroup, Link, Chip, User } from "@nextui-org/react";
import Modal, { DeleteModal } from "./Modal";
import PinButton from "./pinButton";
import * as SolarIconSet from "solar-icon-set";
import Paginator from "./Paginator";
import SearchBar from "./SearchBar";

export default async function Page({ params, searchParams }) {
	const announcementsPerPage = 9;
	const page = searchParams.page || 1;
	const session = await getServerSession(authOptions);
	const selectedSession = params.sessionNumber;
	const query = searchParams.query || "";
	const sessionAnnouncements = await prisma.sessionAnnouncement.findMany({
		where: { session: { number: selectedSession }, OR: [{ title: { contains: query, mode: "insensitive" } }, { markdown: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] },
		orderBy: [{ isPinned: "desc" }, { time: "asc" }],
		include: { user: { select: { officialName: true, id: true, displayName: true, officialSurname: true } } },
		skip: (page - 1) * announcementsPerPage,
		take: announcementsPerPage,
	});
	const total = await prisma.sessionAnnouncement.count({});
	let edit = {};
	if (searchParams.edit)
		edit = await prisma.sessionAnnouncement.findUnique({
			where: { id: searchParams.edit },
		});
	return (
		<>
			<DeleteModal />
			<Modal selectedSession={selectedSession} edit={edit} />
			<TopBar title="Session Announcements">
				{authorize(session, [s.management]) && (
					<Button as={Link} href="?add">
						Announce
					</Button>
				)}
			</TopBar>
			<Frame topContent={<SearchBar />} emptyContent="No Announcements Found" isGrid isEmpty={!total}>
				{sessionAnnouncements.map((announcement) => {
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
			</Frame>
		</>
	);
}
