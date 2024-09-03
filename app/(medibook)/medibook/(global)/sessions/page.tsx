import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Heading } from "@/components/heading";
import { Input, InputGroup } from "@/components/input";
import { Link } from "@/components/link";
import { Select } from "@/components/select";
import { cn } from "@/lib/cn";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import Paginator from "@/components/pagination";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";

export const metadata: Metadata = {
	title: "Sessions",
};

const sessionsPerPage = 6;

export default async function Sessions({ searchParams }) {
	const currentPage = parseInt(searchParams.page) || 1;
	const query = searchParams.search || "";
	const authSession = await auth();

	const whereObject = {
		OR: [
			{ number: { contains: query, mode: "insensitive" } },
			{ theme: { contains: query, mode: "insensitive" } },
			{ subTheme: { contains: query, mode: "insensitive" } },
		],
	};

	let sessions = await prisma.session
		.findMany({
			where: whereObject,
			take: sessionsPerPage,
			include: { Day: { orderBy: { date: "asc" }, where: { type: "CONFERENCE" }, include: { location: true } } },
			skip: (currentPage - 1) * sessionsPerPage,
			orderBy: [{ isCurrent: "desc" }, { numberInteger: "desc" }],
		})
		.catch(notFound);

	const currentSession = await prisma.session
		.findFirst({
			where: {
				OR: [{ isCurrent: true }],
			},
			include: {
				Day: { orderBy: { date: "asc" }, where: { type: "CONFERENCE" }, include: { location: true } },
			},
		})
		.catch(notFound);

	let numberOfSessions = await prisma.session.count({ where: whereObject }).catch(notFound);

	return (
		<>
			<TopBar title="All Sessions" defaultSort="nameasc" searchText="Search sessions..." hideSearchBar={false}>
				{authorize(authSession, [s.admins, s.sd]) && (
					<SearchParamsButton
						searchParams={{
							"create-session": true,
						}}>
						New Session
					</SearchParamsButton>
				)}
			</TopBar>
			{currentPage !== 1 && <Divider className="" />}
			<ul className="">
				{sessions.map((session, index) => {
					const firstDay = session?.Day[0]?.date;
					const firstDayDate = firstDay?.toLocaleString("en-GB").slice(0, 10);
					const lastDayDate = session?.Day[session?.Day.length - 1]?.date.toLocaleString("en-GB").slice(0, 10);
					const location = session?.Day[0]?.location?.name;
					const romanized = romanize(session?.number);
					const isSessionUpcoming = session?.numberInteger > currentSession?.numberInteger;
					const isSessionPast = session?.numberInteger < currentSession?.numberInteger;
					return (
						<>
							<li
								className={cn(
									"bg-cover",
									session?.isCurrent && "mb-6 mt-4 overflow-hidden rounded-lg bg-center text-zinc-800 shadow-md duration-300"
								)}
								style={
									session.isCurrent
										? session.coverImage
											? { backgroundImage: `url(/api/sessions/${session.number}/background)` }
											: { backgroundImage: `url(/gradients/${2}.jpg)` }
										: null
								}
								key={session.id}>
								{!!index && !session?.isCurrent && <Divider soft={index > 0} />}
								<div className={cn("flex items-center justify-between", session?.isCurrent && "bg-white bg-opacity-60 pl-6 pr-4")}>
									<div key={session.id} className="flex gap-6 py-6">
										{!session.isCurrent && (
											<div className="w-[85.33px] shrink-0">
												<Link href={`/medibook/sessions/${session?.number}`} aria-hidden="true">
													{session?.coverImage ? (
														<div
															style={{ backgroundImage: `url(/api/sessions/${session.number}/background)` }}
															className={`flex aspect-square justify-center rounded-lg bg-cover align-middle shadow`}>
															<p className="my-auto translate-y-1 font-[GilroyLight] text-5xl font-light text-white drop-shadow">{session?.number}</p>
														</div>
													) : (
														<div
															style={{ backgroundImage: `url(/gradients/${index + 1}.jpg)` }}
															className={`flex aspect-square justify-center rounded-lg bg-cover align-middle opacity-70 shadow`}>
															<p className="my-auto translate-y-1 font-[GilroyLight] text-5xl font-light text-white drop-shadow">{session?.number}</p>
														</div>
													)}
												</Link>
											</div>
										)}
										<div className="space-y-1.5">
											<div className="text-base/6 font-semibold">
												<Link href={`/medibook/sessions/${session?.number}`}>
													{session?.theme ? `${session?.theme} (Session ${romanized})` : `Annual Session ${romanized}`}
												</Link>
											</div>
											<div className="text-xs/6 text-zinc-500">
												{firstDayDate && lastDayDate ? `${firstDayDate} to ${lastDayDate}` : "No dates set"}
											</div>
											<div className="text-xs/6 text-zinc-600">{location ? `At ${location}` : "No location set"}</div>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<Dropdown>
											<DropdownButton plain aria-label="More options">
												<EllipsisVerticalIcon />
											</DropdownButton>
											<DropdownMenu anchor="bottom end">
												<DropdownItem href={`/medibook/sessions/${session?.number}`}>View</DropdownItem>
												{authorize(authSession, [s.admins, s.sd]) && (
													<DropdownItem href={`/medibook/sessions/${session?.number}/settings`}>Edit</DropdownItem>
												)}
												{authorize(authSession, [s.admins, s.sd]) && (
													<DropdownItem href={`/medibook/sessions/${session?.number}/settings`}>Delete</DropdownItem>
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
			<Paginator itemsOnPage={sessions.length} itemsPerPage={sessionsPerPage} totalItems={numberOfSessions} />
		</>
	);
}
