import prisma from "@/prisma/client";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import { getOrdinal } from "@/lib/get-ordinal";
import Drawer from "./Drawer";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default async function Page({ params }) {
	const committee = await getData(params);
	const session = getServerSession(authOptions);
	if (!committee) return notFound();
	return (
		<>
			<Drawer committee={committee} params={params} />
			<TitleBar
				title="Topic Details"
				button1text="Edit Topics"
				button1roles={[s.management]}
				button1show={session?.user?.roles?.some((role) => role.name === "Manager" && role.committeeId === committee.id)}
				button1href={"/medibook/sessions/" + params.sessionNumber + "/committees/" + (committee.slug || committee.id) + "/topics" + "?edit"}
			/>
			<div className="mx-auto grid w-full max-w-[1200px] gap-2 p-4 md:flex-row">
				<Accordion type="multiple" className="w-full">
					{committee.topic1 && (
						<AccordionItem value="item-1">
							<AccordionTrigger>
								<p className="text-left">
									Topic 1
									<strong className="text-lg">
										<br />
										{committee.topic1}
									</strong>
								</p>
							</AccordionTrigger>
							<AccordionContent>{committee.topic1description}</AccordionContent>
						</AccordionItem>
					)}
					{committee.topic2 && (
						<AccordionItem value="item-2">
							<AccordionTrigger>
								<p className="text-left">
									Topic 2
									<strong className="text-lg">
										<br />
										{committee.topic2}
									</strong>
								</p>
							</AccordionTrigger>
							<AccordionContent>{committee.topic2description}</AccordionContent>
						</AccordionItem>
					)}
					{committee.topic3 && (
						<AccordionItem value="item-3">
							<AccordionTrigger>
								<p className="text-left">
									Topic 3
									<strong className="text-lg">
										<br />
										{committee.topic3}
									</strong>
								</p>
							</AccordionTrigger>
							<AccordionContent>{committee.topic3description}</AccordionContent>
						</AccordionItem>
					)}
				</Accordion>
			</div>
		</>
	);
}

async function getData(params) {
	let committee;
	try {
		committee = await prisma.committee.findFirst({
			where: {
				OR: [{ slug: params.committeeId }, { id: params.committeeId }],
				session: {
					number: params.sessionNumber,
				},
			},
			include: {
				session: {
					select: {
						number: true,
					},
				},
			},
		});
	} catch (e) {}
	if (!committee) return notFound();
	return committee;
}
