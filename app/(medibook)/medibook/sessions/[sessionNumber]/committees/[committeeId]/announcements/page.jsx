import prisma from "@/prisma/client";
import { TitleBar } from "@/components/medibook/TitleBar";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Drawer from "./Drawer";
import Link from "next/link";
import { Card, CardHeader, CardBody, CardFooter, Button, Divider, Chip, User } from "@nextui-org/react";
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
			<TitleBar title="Committee Announcements" button1text="Create Announcement" button1roles={[s.management]} button1href="?create"></TitleBar>
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
