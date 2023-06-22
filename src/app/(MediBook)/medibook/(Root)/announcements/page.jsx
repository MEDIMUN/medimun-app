import SearchBar from "./SearchBar";
import Drawer from "./Drawer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import prisma from "@/prisma/client";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";

export const metadata = {
	title: "Announcements - MediBook",
	description: "View all the latest announcements from MEDIMUN.",
};

const announcementsPerPage = 15;

export default async function Page({ params, searchParams }) {
	const session = await getServerSession(authOptions);
	if (!session || session.isDisabled) redirect("/medibook/signout");

	let skip = searchParams.page ? (searchParams.page - 1) * announcementsPerPage : 0;
	skip = skip < 0 ? 0 : skip;
	const isAlumni = session.pastRoleNames.length > 0 ? { some: {} } : { some: {} };
	const announcements = await prisma.announcement.findMany({
		orderBy: [{ isPinned: "desc" }, { time: "desc" }],
		where: {
			OR: [
				{ isMedibook: true, AlumniAnnouncement: { ...isAlumni } },
				{ isMedibook: true, GlobalAnnouncement: { some: {} } },
				{ isMedibook: true, RegisteredAnnouncement: { some: {} } },
			],
		},
		select: {
			id: true,
			title: true,
			isPinned: true,
			description: true,
			time: true,
			isAnonymous: true,
			isBoard: true,
			isEdited: true,
			isSecretariat: true,
			isWebsite: true,
			AlumniAnnouncement: { select: { id: true } },
			GlobalAnnouncement: { select: { id: true } },
			RegisteredAnnouncement: { select: { id: true } },
			sender: { select: { officialName: true, displayName: true, officialSurname: true } },
		},
		take: announcementsPerPage,
		skip: skip,
	});
	const doesIncludesPinned = announcements.some((announcement) => announcement.isPinned);
	const currentPage = parseInt(searchParams.page || "1");
	return (
		<>
			<Drawer />
			<div className="p-5">
				<SearchBar />
				<div className="mx-auto mt-5 max-w-[1200px] gap-[24px]">
					<div className="mt-5">
						{doesIncludesPinned && (
							<div>
								<h2 className="font-md text-xl font-bold tracking-tight">{announcements.length > 0 ? "Pinned Announcements" : "No Announcements Found"}</h2>
								<ul className="my-2 mb-7 grid grid-rows-3 gap-2 md:grid-cols-2 lg:grid-cols-3">
									{announcements
										.filter((announcement) => announcement.isPinned)
										.map((announcement) => {
											return (
												<li className="list-none" key={announcement.id}>
													<Link href={`/medibook/announcements/${announcement.id}`}>
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
						<h2 className="font-md text-xl font-bold tracking-tight">{announcements.length > 0 ? "Latest Announcements" : ""}</h2>
						<ul>
							{announcements
								.filter((announcement) => !announcement.isPinned)
								.map((announcement) => {
									return (
										<li className="my-2 list-none" key={announcement.id}>
											<Link href={`/medibook/announcements/${announcement.id}`}>
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
						<div className="mx-auto my-5 flex w-auto flex-col justify-center gap-1.5 p-3 md:flex-row">
							<Button disabled={!(!announcements.length < 10 && currentPage > 1)} className="bg-gray-100 text-black shadow-md hover:text-white md:w-[128px]">
								<Link href={`/medibook/announcements?page=1`}>Jump to start</Link>
							</Button>
							<Button disabled={!(currentPage > 1 && announcements.length > 0)} className="shadow-md md:w-[128px]">
								<Link href={`/medibook/announcements?page=${currentPage - 1}`}>Previous</Link>
							</Button>
							<Button disabled={announcements.length < announcementsPerPage} className="shadow-md md:w-[128px]">
								<Link className="w-full" href={`/medibook/announcements?page=${currentPage + 1}`}>
									Next
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
