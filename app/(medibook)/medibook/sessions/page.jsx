import prisma from "@/prisma/client";
import SearchBar from "./SearchBar";
import Link from "next/link";
import SubMenu from "@/components/medibook/SubMenu";
import Modal from "./Modal";
import { TopBar } from "@/components/medibook/TopBar";
import { authorize, s } from "@/lib/authorize";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Button, Spacer, Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
import { notFound } from "next/navigation";

export const metadata = {
	title: "Sessions - MediBook",
	description: "All Sessions of the Mediterranean Model United Nations",
};

export default async function Page({ searchParams }) {
	let data = GetData(searchParams.query);
	let session = getServerSession(authOptions);
	[session, data] = await Promise.all([session, data]);
	return (
		<>
			<Modal />
			<TopBar title="All Sessions">
				{authorize(session, [s.admins, s.director, s.sd]) && (
					<Button as={Link} href="/medibook/sessions?add">
						Add Session
					</Button>
				)}
			</TopBar>
			<div className="h-[calc(100%-90px)] overflow-y-auto rounded-2xl border-1 border-gray-200 p-4">
				<SearchBar />
				<ul className="mx-auto mt-4 grid h-auto max-w-[1200px] grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
					{data.map((session) => (
						<Card key={session.number}>
							<CardHeader>
								<div className="flex flex-col align-middle">
									<h2 className={`${session.isCurrent ? "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" : "bg-black"} my-auto mr-3 flex h-[40px] w-[40px] justify-center rounded-xl px-3 align-middle text-[24px] text-white shadow-xl`}>
										<span className="my-auto font-thin">{session.number}</span>
									</h2>
									<div className="mt-[6px] leading-[20px]">
										<div>
											<p className="text-large font-medium text-black">{session.theme || "Session " + session.number}</p>
											<h4 className="text-tiny font-bold uppercase text-black/60">{session.phrase2 || "Session " + session.roman}</h4>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardFooter className="mt-0">
								<Button className="w-full" as={Link} href={`/medibook/sessions/${session.number}`}>
									Explore
								</Button>
							</CardFooter>
						</Card>
					))}
				</ul>
			</div>
		</>
	);
}

async function GetData(query) {
	if (!query) return await prisma.session.findMany({ take: 9, orderBy: { numberInteger: "desc" } }).catch(notFound);
	return await prisma.session.findMany({ where: { OR: [{ number: { contains: query, mode: "insensitive" } }, { theme: { contains: query, mode: "insensitive" } }, { phrase2: { contains: query, mode: "insensitive" } }] }, take: 9, orderBy: { numberInteger: "desc" } }).catch(notFound);
}
