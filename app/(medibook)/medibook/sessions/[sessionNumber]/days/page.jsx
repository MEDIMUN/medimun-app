import prisma from "@/prisma/client";
import { getOrdinal } from "@lib/get-ordinal";
import Modal, { DeleteModal } from "./Modal";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/medibook/TopBar";
import { Frame } from "@/components/medibook/Frame";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Card, CardHeader, CardBody, CardFooter, Divider, Image, Button, Avatar } from "@nextui-org/react";
import * as SolarIconSet from "solar-icon-set";

export const metadata = {
	title: "Days",
	description: "Days of the session",
};

export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }) {
	let session = await getServerSession(authOptions);
	const selectedSession = params.sessionNumber;
	let days = await prisma.day
		.findMany({
			where: { session: { number: selectedSession } },
			orderBy: [{ date: "asc" }],
			include: { location: true },
		})
		.catch(() => notFound());
	const locations = await prisma.location.findMany().catch(() => notFound());
	const edit = await prisma.day.findFirst({ where: { id: searchParams.edit || "" }, include: { location: true } }).catch(() => notFound());

	await prisma.session.findFirstOrThrow({ where: { number: selectedSession } }).catch(() => notFound());
	let conferenceDays = days.filter((day) => day.type == "CONFERENCE");
	let workshopDays = days.filter((day) => day.type == "WORKSHOP");
	conferenceDays = conferenceDays.map((day, index) => {
		day.type = "Conference";
		day.index = index;
		return day;
	});
	workshopDays = workshopDays.map((day, index) => {
		day.type = "Workshop";
		day.index = index;
		return day;
	});
	days = [...conferenceDays, ...workshopDays];
	const ordinal = getOrdinal(selectedSession);
	return (
		<>
			<Modal locations={locations} edit={edit} selectedSession={selectedSession} />
			<DeleteModal />
			<TopBar
				title={
					<>
						{selectedSession}
						<sup>{ordinal}</sup> Annual Session Days
					</>
				}>
				{authorize(session, [s.sd, s.admins, s.director]) && (
					<Button as={Link} href="?add">
						Add Day
					</Button>
				)}
			</TopBar>
			<Frame isGrid>
				{days?.map((day, index) => {
					const date = new Date(day.date).toUTCString().slice(0, 16);
					const today = new Date().toUTCString().slice(0, 16);
					return (
						<Card key={index} className={`${day.type == "Conference" && "bg-gray-100"} ${date == today && "bg-gray-200"}`}>
							<CardHeader>
								<div className="flex flex-col align-middle">
									<h2 className={`${date == today ? "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" : "bg-black"} my-auto mr-3 flex h-[40px] w-[40px] justify-center rounded-xl px-3 align-middle text-[24px] text-white shadow-xl`}>
										<span className="my-auto font-thin">{(day.index + 1).toString()}</span>
									</h2>
									<div className="mt-[6px] leading-[20px]">
										<div>
											<p className="text-large font-medium text-black">{`${day.type} Day ${day.index + 1} ${date == today ? "(Today)" : ""}`}</p>
											<h4 className="text-tiny font-bold uppercase text-black/60">{day.date.toUTCString().slice(0, 16)}</h4>
											{day.location?.name && <h4 className="text-tiny font-bold uppercase text-black/60">{day?.location?.name}</h4>}
										</div>
									</div>
								</div>
							</CardHeader>
							<CardFooter className="bottom-0 gap-2 pt-0">
								<Button className="w-full">Explore</Button>
								{authorize(session, [s.management]) && (
									<Button as={Link} href={`?edit=${day.id}`} isIconOnly>
										<SolarIconSet.PenNewSquare iconStyle="Outline" size={24} />
									</Button>
								)}
								{authorize(session, [s.sd]) && (
									<Button as={Link} href={`?delete=${day.id}`} color="danger" isIconOnly>
										<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" size={24} />
									</Button>
								)}
							</CardFooter>
						</Card>
					);
				})}
			</Frame>
		</>
	);
}
