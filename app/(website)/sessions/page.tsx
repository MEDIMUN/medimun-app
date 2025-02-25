import Paginator from "@/components/pagination";
import { Fragment, Suspense } from "react";
import { Topbar } from "../server-components";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { romanize } from "@/lib/romanize";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { Badge } from "@/components/badge";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Divider } from "@/components/divider";
import { Code } from "@/components/text";
import { Ellipsis } from "lucide-react";

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const currentPage = parseInt(searchParams.page) || 1;

	const whereObject = {
		isPartlyVisible: true,
	};

	const [sessions, numberOfSessions] = await prisma
		.$transaction([
			prisma.session.findMany({
				where: whereObject,
				take: 5,
				include: { Day: { orderBy: { date: "asc" }, where: { type: "CONFERENCE" }, include: { location: true } } },
				skip: (currentPage - 1) * 10,
				orderBy: [{ isMainShown: "desc" }, { numberInteger: "desc" }],
			}),
			prisma.session.count({ where: whereObject }),
		])
		.catch(notFound);

	if (!sessions.length) {
		return (
			<div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center">
				<Code className="text-4xl">No sessions found</Code>
			</div>
		);
	}

	return (
		<>
			<Topbar
				title={"All conference sessions"}
				description={
					<>
						Browse all past, current and future conference sessions.
						<br />
						See the details and find the the information you need.
					</>
				}
			/>
			{!!sessions.length && (
				<ul className="mx-auto font-[montserrat] max-w-7xl px-5">
					{sessions.map((session, index) => {
						const firstDay = session?.Day[0]?.date;
						const firstDayDate = firstDay?.toLocaleString("en-GB").slice(0, 10);
						const lastDayDate = session?.Day[session?.Day.length - 1]?.date.toLocaleString("en-GB").slice(0, 10);
						const location = session?.Day[0]?.location?.name;
						const romanized = romanize(session?.numberInteger);
						return (
							<Fragment key={session.id}>
								<li
									className={cn("bg-cover", session?.isMainShown && "mb-6 overflow-hidden rounded-lg text-zinc-800 shadow-md duration-300")}
									style={session.isMainShown ? (session.cover ? { backgroundImage: `url(/api/sessions/${session.id}/cover)` } : { backgroundImage: `url(/assets/gradients/${2}.jpg)` }) : null}>
									{!!index && !session?.isMainShown && <Divider soft={index > 0} />}
									<div className={cn("flex items-center justify-between", session?.isMainShown && "bg-white bg-opacity-60 pl-6 pr-4")}>
										<div key={session.id} className="flex gap-6 py-6">
											{!session.isMainShown && (
												<div className="w-[85.33px] shrink-0">
													<Link href={`/sessions/${session?.number}`} aria-hidden="true">
														{session?.cover ? (
															<div style={{ backgroundImage: `url(/api/sessions/${session.id}/cover)` }} className={`flex aspect-square justify-center rounded-lg bg-cover align-middle shadow`}>
																<p className="my-auto translate-y-1 font-[GilroyLight] text-5xl font-light text-white drop-shadow">{session.number}</p>
															</div>
														) : (
															<div style={{ backgroundImage: `url(/assets/gradients/${index + 1}.jpg)` }} className={`flex aspect-square justify-center rounded-lg bg-cover align-middle opacity-70 shadow`}>
																<p className="my-auto translate-y-1 font-[GilroyLight] text-5xl font-light text-white drop-shadow">{session.number}</p>
															</div>
														)}
													</Link>
												</div>
											)}
											<div className="space-y-1.5">
												<div className="text-base/6 font-semibold">
													<Link href={`/sessions/${session?.number}`}>
														{session.theme ? (
															<>
																{session.theme} <Badge className="font-light">Session {romanized}</Badge>
															</>
														) : (
															`Session ${romanized}`
														)}{" "}
													</Link>
												</div>
												<div className="line-clamp-1 text-xs/6 text-zinc-500">
													{firstDayDate && lastDayDate ? `${firstDayDate} to ${lastDayDate}` : "No dates set"}
													{location ? ` • ${location}` : " • No location set"}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<Dropdown>
												<DropdownButton plain aria-label="More options">
													<Ellipsis width={18} />
												</DropdownButton>
												<DropdownMenu anchor="bottom end " className="font-[montserrat]">
													<DropdownItem href={`/medibook/sessions/${session?.number}`}>View on MediBook</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</div>
									</div>
								</li>
							</Fragment>
						);
					})}
				</ul>
			)}
		</>
	);
}

const researchBooklets = [
	{ name: "General Assembly 1", href: "https://drive.google.com/file/d/1uye5uwpkvhsBtJV7bIN4zDnKDjgLHUG2/view?usp=sharing" },
	{ name: "General Assembly 2", href: "https://drive.google.com/file/d/1Z5OvpZd3elmJ_c6v1tk8WCuO9RjWPN_Z/view?usp=sharing" },
	{ name: "General Assembly 3", href: "https://drive.google.com/file/d/16_SYkqQeRVIBbWUnYnWvCW3kPN7gBeEb/view?usp=sharing" },
	{ name: "General Assembly 4", href: "https://drive.google.com/file/d/1UOVvLd80sLPkHkvAF1ShUgWz2UqfOe47/view?usp=sharing" },
	{ name: "Security Council", href: "https://drive.google.com/file/d/1FBAv5s9VfFcTzERZiumOax8gldxLkCT_/view?usp=sharing" },
	{ name: "Historical Security Council", href: "https://drive.google.com/file/d/1x9GADBXTiMFeBCAukIzo-700SMsBznDS/view?usp=sharing" },
	{ name: "Commission on the Status of Women", href: "https://drive.google.com/file/d/1YNRKOvia9_r0LzLdIRH5LDAdxkDGzrQe/view?usp=sharing" },
];
