import prisma from "@/prisma/client";
import { getOrdinal } from "@lib/get-ordinal";
import { Button } from "@/components/ui/button";
import Drawer from "./Drawer";
import Link from "next/link";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";

export const metadata = {
	title: "Days",
	description: "Days of the session",
};

export default async function Page({ params, searchParams }) {
	const selectedSession = params.sessionNumber;
	const { conferenceDays, workshopDays } = await getData(selectedSession);
	const ordinal = getOrdinal(selectedSession);
	return (
		<>
			<Drawer selectedSession={selectedSession} />
			<TitleBar
				title={`${selectedSession + ordinal} Annual Session Days`}
				button1roles={[s.sd, s.director, s.admins]}
				button1text="Add Day"
				button1href="?add"
				button1style="text-black bg-white"
			/>
			<div className="mx-auto mt-5 flex max-w-[1248px] flex-col p-6 font-[montserrat] text-3xl font-extralight">
				<h2 className="pl-4  text-[18px] font-[700]  uppercase">COnference Days</h2>
				<div className="grid">
					{conferenceDays.map((day) => {
						return (
							<Link key={Math.random()} href={`/medibook/sessions/${selectedSession}/days/${day.id}`}>
								<Card className="flex flex-row bg-gradient-to-r from-medired  to-red-500 duration-300 md:shadow-xl md:hover:shadow-md">
									<CardHeader>
										<CardTitle className="truncate text-white">{day.date.toDateString()}</CardTitle>
										{day.name && <CardDescription className="truncate text-slate-100">{day.name}</CardDescription>}
									</CardHeader>
									<CardFooter className="my-auto ml-auto flex h-full py-0">
										<Button className="bg-white text-black hover:text-white">
											Explore <ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</CardFooter>
								</Card>
							</Link>
						);
					})}
				</div>
				<h2 className="pl-4 pt-4 font-[montserrat] text-[18px] font-[700]  uppercase">Workshop Days</h2>
				<div className="grid gap-5">
					{workshopDays.map((day, index) => {
						return (
							<Link key={Math.random()} href={`/medibook/sessions/${selectedSession}/days/${day.id}`}>
								<Card className="flex flex-row duration-300 md:shadow-xl md:hover:shadow-md">
									<CardHeader>
										<CardTitle className="truncate">{day.date.toDateString()}</CardTitle>
										<CardDescription className="truncate">
											Conference Day {index + 1}
											{day.name && " • " + day.name}
										</CardDescription>
									</CardHeader>
									<CardFooter className="my-auto ml-auto flex h-full py-0">
										<Button>
											Explore <ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</CardFooter>
								</Card>
							</Link>
						);
					})}
				</div>
			</div>
		</>
	);
}

async function getData(params) {
	prisma.$connect();
	let conferenceDays, workshopDays;
	try {
		conferenceDays = await prisma.conferenceDay.findMany({
			where: { session: { number: params } },
			orderBy: [{ date: "asc" }],
		});
		workshopDays = await prisma.workshopDay.findMany({
			where: { session: { number: params } },
			orderBy: [{ date: "asc" }],
		});
	} catch (e) {
		console.log(e);
	}

	console.log(conferenceDays, workshopDays);

	return {
		conferenceDays,
		workshopDays,
	};
}
