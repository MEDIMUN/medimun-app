import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Drawer from "./Drawer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const announcementsPerPage = 10;

export default async function Page({ params, searchParams }) {
	const session = await getServerSession(authOptions);

	const committee = await getData(params);

	if (!session || session.isDisabled) redirect("/medibook/signout");
	if (!committee) notFound();

	const showButton1 = session.currentRoles.some((role) => role.name === "Manager" && role.committeeId === committee.id);

	let skip = searchParams.page ? (searchParams.page - 1) * announcementsPerPage : 0;
	skip = skip < 0 ? 0 : skip;
	const announcements = await prisma.announcement.findMany({
		orderBy: [{ isPinned: "desc" }, { time: "desc" }],
		where: {
			CommitteeAnnouncement: {
				some: {
					committee: {
						id: committee.id,
					},
				},
			},
		},
		include: {
			CommitteeAnnouncement: { select: { id: true } },
			user: { select: { officialName: true, displayName: true, officialSurname: true } },
		},
		take: announcementsPerPage,
		skip: skip,
	});
	const doesIncludesPinned = announcements.some((announcement) => announcement.isPinned);
	const currentPage = parseInt(searchParams.page || "1");

	return (
		<>
			<Drawer props={{ committeeId: committee.id, sessionNumber: params.sessionNumber, committeeSlug: committee.slug }} />
			<div className="p-5">
				<div className="mx-auto mt-5 max-w-[1200px] gap-[24px]">
					<div className="mt-5">
						{doesIncludesPinned && (
							<div>
								<h2 className="font-md ml-5 text-xl font-bold tracking-tight">{announcements.length > 0 ? "Pinned Announcements" : "No Announcements Found"}</h2>
								<ul className="my-2 mb-7 grid grid-rows-3 gap-2 md:grid-cols-2 lg:grid-cols-3">
									{announcements
										.filter((announcement) => announcement.isPinned)
										.map((announcement) => {
											return (
												<li className="list-none" key={announcement.id}>
													<Link href={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/announcements/${announcement.id}`}>
														<Card className="shadow-xl duration-300 hover:shadow-md">
															<CardHeader>
																<CardTitle className="truncate">
																	{"📌 "}
																	{announcement.title}
																</CardTitle>
																<CardDescription className="truncate">{announcement.description}</CardDescription>
															</CardHeader>
														</Card>
													</Link>
												</li>
											);
										})}
								</ul>
							</div>
						)}
						<h2 className="font-md ml-5 text-xl font-bold tracking-tight">
							{announcements.filter((announcement) => {
								!announcement.isPinned;
							}).length > 0
								? "Latest Announcements"
								: ""}
						</h2>
						<ul>
							{announcements
								.filter((announcement) => !announcement.isPinned)
								.map((announcement) => {
									return (
										<li className="my-2 list-none" key={announcement.id}>
											<Link href={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/announcements/${announcement.id}`}>
												<Card className={`duration-300 hover:shadow-md ${announcement.isPinned && "border-red-500 shadow-xl"}`}>
													<CardHeader>
														<CardTitle className="truncate">{announcement.title}</CardTitle>
														<CardDescription className="truncate">{announcement.description}</CardDescription>
													</CardHeader>
												</Card>
											</Link>
										</li>
									);
								})}
						</ul>
						<div className="mx-auto my-10 flex w-auto flex-col justify-center gap-1.5 p-3 md:flex-row">
							{!announcements.length < 10 && currentPage > 1 && (
								<Link href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || params.committeeId}/announcements?page=1`}>
									<Button className="bg-gray-100 text-black shadow-md hover:text-white md:w-[64px]">0</Button>
								</Link>
							)}
							{currentPage > 1 && announcements.length > 0 && (
								<Link href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || params.committeeId}/announcements?page=${currentPage - 1}`}>
									<Button className="shadow-md md:w-[128px]">← Previous</Button>
								</Link>
							)}
							{!(announcements.length < announcementsPerPage) && (
								<Link href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || params.committeeId}/announcements?page=${currentPage + 1}`}>
									<Button className="shadow-md md:w-[128px]">Next →</Button>
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

async function getData(params) {
	let committee;
	try {
		committee = await prisma.committee.findFirst({
			where: {
				OR: [{ slug: params.committeeId }, { id: params.committeeId }],
				session: {
					number: params.sessionNumber,
				},
			},
			select: {
				id: true,
				name: true,
				slug: true,
				session: {
					select: {
						number: true,
					},
				},
			},
		});
	} catch (e) {}
	return committee;
}
