import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import Drawer from "./Drawer";
import Link from "next/link";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/prisma/client";
import { ArrowRight } from "lucide-react";

export default async function Page() {
	const locations = await getData();
	return (
		<>
			<Drawer />
			<TitleBar button1text="Add Location" button1href="/medibook/locations?add" button1roles={[s.management]} title="Locations" />
			<div className="mx-auto flex max-w-[1248px] flex-col p-6 font-[montserrat] text-3xl font-extralight">
				<div className="grid gap-5">
					{locations.map((location, index) => {
						return (
							<Link key={Math.random()} href={`/medibook/locations/${location.id}`}>
								<Card className="flex flex-row duration-300 md:shadow-xl md:hover:shadow-md">
									<CardHeader>
										<CardTitle className="truncate">{location.name}</CardTitle>
										<CardDescription className="truncate">{location.street + ", " + location.state + ", " + location.zipCode + ", " + location.country}</CardDescription>
									</CardHeader>
									<CardFooter className="my-auto ml-auto flex h-full gap-2 py-0">
										<Button>Edit</Button>
										<Button>View</Button>
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

async function getData() {
	prisma.$connect();
	let locations;
	try {
		locations = await prisma.location.findMany();
	} catch (e) {}

	return locations;
}
