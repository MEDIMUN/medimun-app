import SearchBar from "./SearchBar";
import Drawer from "./Drawer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import TopBar from "@/components/medibook/TopBar";

export const metadata = {
	title: "Announcements - MediBook",
	description: "View all the latest announcements from MEDIMUN.",
};

const announcementsPerPage = 10;

export default async function Page({ params, searchParams }) {
	const session = await getServerSession(authOptions);

	const createQueryString = (name, value) => {
		const params = new URLSearchParams(searchParams);
		params.set(name, value);
		return params.toString();
	};

	function error(e) {
		return;
	}

	let skip = searchParams.page ? (searchParams.page - 1) * announcementsPerPage : 0;
	skip = skip < 0 ? 0 : skip;
	const isAlumni = session.pastRoleNames.length > 0 ? { some: {} } : { some: {} };
	const announcements = await prisma.announcement
		.findMany({
			orderBy: [{ isPinned: "desc" }, { time: "desc" }],
			where: {
				OR: [
					{ title: { contains: searchParams.search, mode: "insensitive" }, MediBookAnnouncement: { ...isAlumni } },
					{ title: { contains: searchParams.search, mode: "insensitive" }, GlobalAnnouncement: { some: {} } },
				],
			},
			include: {
				MediBookAnnouncement: { select: { id: true } },
				user: { select: { officialName: true, displayName: true, officialSurname: true } },
			},
			take: announcementsPerPage,
			skip: skip,
		})
		.catch((e) => error(e));
	const doesIncludesPinned = announcements.some((announcement) => announcement.isPinned);
	const currentPage = parseInt(searchParams.page || "1");
	return (
		<>
			<Drawer />
			<TopBar />
			<div className="p-5">
				<SearchBar />
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
						<div className="mx-auto my-10 flex w-auto flex-col justify-center gap-1.5 p-3 md:flex-row">
							{!announcements.length < 10 && currentPage > 1 && (
								<Link href={`/medibook/announcements?${createQueryString("page", 1)}`}>
									<Button className="bg-gray-100 text-black shadow-md hover:text-white md:w-[64px]">0</Button>
								</Link>
							)}
							{currentPage > 1 && announcements.length > 0 && (
								<Link href={`/medibook/announcements?${createQueryString("page", currentPage - 1)}`}>
									<Button className="shadow-md md:w-[128px]">← Previous</Button>
								</Link>
							)}
							{!(announcements.length < announcementsPerPage) && (
								<Link href={`/medibook/announcements?${createQueryString("page", currentPage + 1)}`}>
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
