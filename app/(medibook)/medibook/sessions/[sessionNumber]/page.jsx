import prisma from "@/prisma/client";
import { getOrdinal } from "@lib/get-ordinal";
import Drawer from "./Drawer";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { TitleBar } from "@/components/medibook/TitleBar";
import { authorize, s } from "@/lib/authorize";
import { notFound } from "next/navigation";
import { Card, Image, CardHeader, CardBody, CardFooter, Button, Chip, Avatar, AvatarGroup, Divider } from "@nextui-org/react";
import { capitaliseEachWord } from "@/lib/capitaliseEachWord";
import DepartmentDrawer from "./DepartmentDrawer";
import Dropdown from "./Dropdown";
import { Tooltip } from "@nextui-org/react";
import { TopBar } from "@/components/medibook/TopBar";
import { Frame } from "@/components/medibook/Frame";
export const revalidate = 60;

export async function generateMetadata({ params }) {
	const sessionNumber = params.sessionNumber;
	const ordinal = getOrdinal(params.sessionNumber);
	return { title: `${sessionNumber + ordinal} Annual Session - MediBook`, description: `${sessionNumber + ordinal} Annual Session of the Mediterranean Model United Nations` };
}

async function getSessionData(params) {
	return await prisma.session.findFirstOrThrow({ where: { number: params.sessionNumber } }).catch(() => notFound());
}

export default async function Page({ params, searchParams }) {
	let session = getServerSession(authOptions),
		selectedSession = getSessionData(params);
	[session, selectedSession] = await Promise.all([session, selectedSession]);

	const numberOfDelegates = await prisma.delegate.count({
		where: {
			committee: {
				session: {
					number: params.sessionNumber,
				},
			},
		},
	});

	const numberOfMembers = await prisma.member.count({
		where: {
			department: {
				session: {
					number: params.sessionNumber,
				},
			},
		},
	});

	const latestSessionAnnouncements = await prisma.sessionAnnouncement.findMany({
		where: {
			session: {
				number: params.sessionNumber,
			},
		},
		orderBy: {
			time: "desc",
		},
		take: 3,
		select: {
			id: true,
			title: true,
			markdown: true,
			time: true,
		},
	});

	let numberOfNationalities = await prisma.delegate.findMany({
		where: {
			committee: {
				session: {
					number: params.sessionNumber,
				},
			},
		},
		select: {
			user: {
				select: {
					nationality: true,
				},
			},
		},
	});

	console.log(numberOfNationalities);
	const ordinal = getOrdinal(selectedSession.number);

	return (
		<>
			<Drawer selectedSession={selectedSession} />
			<DepartmentDrawer props={params} />
			<TopBar
				title={
					<>
						{selectedSession.number}
						<sup>{ordinal}</sup> Annual Session
					</>
				}>
				<Dropdown className="mt-auto" session={session} />
			</TopBar>
			<Frame nonEqualY isGrid>
				<div className="flex w-full rounded-xl  bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100 font-[montserrat] lg:col-span-2 xl:col-span-3">
					<div className="mt-20 p-4 px-6 text-2xl">
						<p className="font-[500]">{selectedSession.theme}</p>
						<p className=""> {selectedSession.phrase2}</p>
					</div>
				</div>
				<div className="flex w-full rounded-xl bg-gray-100  font-[montserrat]">
					<div className="mt-auto p-4 px-6 text-2xl">
						<p className="font-[500]">{Math.ceil(numberOfDelegates / 50) * 50}</p>
						<p className="text-sm">Delegates</p>
					</div>
				</div>
				<div className="flex w-full rounded-xl bg-gray-100  font-[montserrat]">
					<div className="mt-auto p-4 px-6 text-2xl">
						<p className="font-[500]">{Math.ceil(numberOfMembers / 50) * 50}</p>
						<p className="text-sm">Student Officers</p>
					</div>
				</div>
				<div className="flex w-full rounded-xl bg-gray-100  font-[montserrat]">
					<div className="mt-auto p-4 px-6 text-2xl">
						<p className="font-[500]">{1}</p>
						<p className="text-sm">Nationalities</p>
					</div>
				</div>
				<div className="flex w-full flex-col rounded-xl bg-gray-100 p-4  font-[montserrat]">
					<p className="font-[500]">Latest Announcements</p>
					{latestSessionAnnouncements.map((announcement) => (
						<Link key={announcement.id} href={`/medibook/sessions/${params.sessionNumber}/announcements/${announcement.id}`}>
							<div className="mt-2 rounded-lg bg-gray-200 p-2">
								<p className="line-clamp-1">{announcement.title}</p>
								<p className="line-clamp-1 text-tiny">{announcement.markdown}</p>
							</div>
						</Link>
					))}
				</div>
			</Frame>
		</>
	);
}
