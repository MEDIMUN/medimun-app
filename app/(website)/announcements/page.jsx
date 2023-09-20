import prisma from "@/prisma/client";
import Background from "@/components/website/Background";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page() {
	const announcements = await getData();
	const id = Math.random().toString(36);
	return (
		<>
			<Background height={id} />
			<div id={id} className="z-[40] h-auto w-full bg-transparent bg-cover font-[Montserrat] text-xl font-[700] text-white">
				<div className="mx-auto flex h-auto w-full max-w-[1200px] flex-col gap-10 bg-transparent pt-[96px] md:p-4 md:pt-[96px]">
					<div>
						<h1 className="ml-4 rounded-3xl font-[Montserrat] text-[35px] font-[700] text-white">Announcements</h1>
						<h2 className="ml-4 mt-2 rounded-3xl font-[Montserrat] text-[20px] font-[300] text-white">Explore the latest announcements from organizers</h2>
						{announcements.length !== 0 ? (
							<ul className="bg-transparent">
								{announcements.map((announcement, index) => (
									<Link href={`/announcements/${announcement.id}`}>
										<li key={announcement.id} className="h-auto bg-opacity-50 px-4 py-2 leading-normal">
											<div className="flex h-min cursor-pointer gap-2 rounded-md bg-gray-300 p-2 duration-300 hover:bg-medired md:flex-row md:hover:shadow-lg">
												<div className="align-center flex h-[68px] w-[68px] justify-center rounded-sm bg-gray-200 text-center text-[40px] text-black shadow-md">
													<span className="my-auto w-[68px]">{index + 1}</span>
												</div>
												<div className="flex max-w-full flex-col truncate text-[var(--medired)] duration-1000">
													<h2 className="mb-2 mt-0 h-min w-min max-w-full truncate rounded-sm bg-gray-200 px-2 text-[25px] shadow-md">{announcement.title}</h2>
													<h3 className="w-max max-w-full truncate rounded-sm bg-gray-200 px-2 text-[15px] shadow-md">{announcement.description}</h3>
												</div>
											</div>
										</li>
									</Link>
								))}
							</ul>
						) : (
							<div className="p-4 text-sm uppercase">No Announcements Found</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

async function getData() {
	let announcements = [];
	try {
		announcements = await prisma.announcement.findMany({
			where: {
				WebsiteAnnouncement: { some: {} },
			},
			orderBy: {
				time: "desc",
			},
			take: 10,
		});
	} catch (e) {
		console.log(e);
		notFound();
	}
	return announcements;
}
